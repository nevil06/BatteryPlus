package expo.modules.batterynative

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class BatteryNativeModule : Module() {
    private val context: Context
        get() = appContext.reactContext ?: throw IllegalStateException("React context is null")

    override fun definition() = ModuleDefinition {
        Name("BatteryNative")

        Function("getBatteryInfo") {
            getBatteryInfo()
        }

        Function("getCycleCount") {
            getCycleCount()
        }

        Function("getDesignCapacity") {
            getDesignCapacity()
        }

        Function("getChargeTimeRemaining") {
            getChargeTimeRemaining()
        }
    }

    private fun getBatteryInfo(): Map<String, Any> {
        val manager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val intent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))

        val result = mutableMapOf<String, Any>()

        // From BatteryManager.getIntProperty()
        result["currentNow"] = manager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW)
        result["currentAverage"] = manager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_AVERAGE)
        result["chargeCounter"] = manager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CHARGE_COUNTER)
        result["capacity"] = manager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            result["energyCounter"] = manager.getLongProperty(BatteryManager.BATTERY_PROPERTY_ENERGY_COUNTER)
        }

        // From Intent extras
        intent?.let {
            result["health"] = getHealthString(it.getIntExtra(BatteryManager.EXTRA_HEALTH, BatteryManager.BATTERY_HEALTH_UNKNOWN))
            result["temperature"] = it.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, -1) / 10.0
            result["voltage"] = it.getIntExtra(BatteryManager.EXTRA_VOLTAGE, -1)
            result["technology"] = it.getStringExtra(BatteryManager.EXTRA_TECHNOLOGY) ?: "Unknown"
            result["plugType"] = getPlugTypeString(it.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0))
            result["status"] = getStatusString(it.getIntExtra(BatteryManager.EXTRA_STATUS, BatteryManager.BATTERY_STATUS_UNKNOWN))
            result["level"] = it.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
            result["scale"] = it.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
        }

        // Charge time remaining (API 28+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            result["chargeTimeRemaining"] = manager.computeChargeTimeRemaining()
        } else {
            result["chargeTimeRemaining"] = -1L
        }

        // Cycle count
        result["cycleCount"] = getCycleCount()

        // Design capacity
        result["designCapacity"] = getDesignCapacity()

        return result
    }

    private fun getCycleCount(): Int {
        val paths = arrayOf(
            "/sys/class/power_supply/battery/cycle_count",
            "/sys/class/power_supply/bms/cycle_count",
            "/sys/class/power_supply/Battery/cycle_count"
        )

        for (path in paths) {
            try {
                val file = File(path)
                if (file.exists() && file.canRead()) {
                    val content = file.readText().trim()
                    val count = content.toIntOrNull()
                    if (count != null && count >= 0) {
                        return count
                    }
                }
            } catch (e: Exception) {
                // Continue to next path
            }
        }

        return -1
    }

    private fun getDesignCapacity(): Int {
        // Try PowerProfile reflection first
        try {
            val powerProfileClass = Class.forName("com.android.internal.os.PowerProfile")
            val constructor = powerProfileClass.getConstructor(Context::class.java)
            val powerProfile = constructor.newInstance(context)
            val method = powerProfileClass.getMethod("getBatteryCapacity")
            val capacity = method.invoke(powerProfile) as Double
            if (capacity > 0) {
                return capacity.toInt()
            }
        } catch (e: Exception) {
            // Fall through to filesystem approach
        }

        // Try filesystem paths
        val paths = arrayOf(
            "/sys/class/power_supply/battery/charge_full_design",
            "/sys/class/power_supply/bms/charge_full_design",
            "/sys/class/power_supply/Battery/charge_full_design"
        )

        for (path in paths) {
            try {
                val file = File(path)
                if (file.exists() && file.canRead()) {
                    val content = file.readText().trim()
                    val capacity = content.toIntOrNull()
                    if (capacity != null && capacity > 0) {
                        // Value is in microampere-hours, convert to mAh
                        return capacity / 1000
                    }
                }
            } catch (e: Exception) {
                // Continue to next path
            }
        }

        return -1
    }

    private fun getChargeTimeRemaining(): Long {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val manager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            return manager.computeChargeTimeRemaining()
        }
        return -1L
    }

    private fun getHealthString(health: Int): String {
        return when (health) {
            BatteryManager.BATTERY_HEALTH_GOOD -> "Good"
            BatteryManager.BATTERY_HEALTH_OVERHEAT -> "Overheat"
            BatteryManager.BATTERY_HEALTH_DEAD -> "Dead"
            BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> "Over Voltage"
            BatteryManager.BATTERY_HEALTH_COLD -> "Cold"
            BatteryManager.BATTERY_HEALTH_UNSPECIFIED_FAILURE -> "Failure"
            else -> "Unknown"
        }
    }

    private fun getPlugTypeString(plugged: Int): String {
        return when (plugged) {
            BatteryManager.BATTERY_PLUGGED_AC -> "AC"
            BatteryManager.BATTERY_PLUGGED_USB -> "USB"
            BatteryManager.BATTERY_PLUGGED_WIRELESS -> "Wireless"
            else -> "None"
        }
    }

    private fun getStatusString(status: Int): String {
        return when (status) {
            BatteryManager.BATTERY_STATUS_CHARGING -> "Charging"
            BatteryManager.BATTERY_STATUS_DISCHARGING -> "Discharging"
            BatteryManager.BATTERY_STATUS_FULL -> "Full"
            BatteryManager.BATTERY_STATUS_NOT_CHARGING -> "Not Charging"
            else -> "Unknown"
        }
    }
}
