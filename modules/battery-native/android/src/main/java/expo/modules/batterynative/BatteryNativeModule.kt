package expo.modules.batterynative

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.BufferedReader
import java.io.FileReader

class BatteryNativeModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exception("React context is null")

  override fun definition() = ModuleDefinition {
    Name("BatteryNative")

    // Get all battery information at once
    Function("getBatteryInfo") {
      getBatteryInfo()
    }

    // Get current battery level (0-100)
    Function("getBatteryLevel") {
      getBatteryLevel()
    }

    // Get battery health status
    Function("getHealthStatus") {
      getHealthStatus()
    }

    // Get battery temperature in Celsius
    Function("getTemperature") {
      getTemperature()
    }

    // Get battery voltage in millivolts
    Function("getVoltage") {
      getVoltage()
    }

    // Get charging status
    Function("getChargingStatus") {
      getChargingStatus()
    }

    // Get charge plug type (USB, AC, Wireless)
    Function("getPlugType") {
      getPlugType()
    }

    // Get battery technology (Li-ion, etc)
    Function("getTechnology") {
      getTechnology()
    }

    // Get current now in microamperes (discharge/charge rate)
    Function("getCurrentNow") {
      getCurrentNow()
    }

    // Get average current in microamperes
    Function("getCurrentAverage") {
      getCurrentAverage()
    }

    // Get charge counter in microampere-hours
    Function("getChargeCounter") {
      getChargeCounter()
    }

    // Get energy counter in nanowatt-hours
    Function("getEnergyCounter") {
      getEnergyCounter()
    }

    // Get battery capacity in mAh (design capacity)
    Function("getDesignCapacity") {
      getDesignCapacity()
    }

    // Get charge time remaining in milliseconds (API 28+)
    Function("getChargeTimeRemaining") {
      getChargeTimeRemaining()
    }

    // Get battery cycle count (if available)
    Function("getCycleCount") {
      getCycleCount()
    }

    // Check if battery is present
    Function("isBatteryPresent") {
      isBatteryPresent()
    }
  }

  private fun getBatteryIntent(): Intent? {
    val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
    return context.registerReceiver(null, filter)
  }

  private fun getBatteryManager(): BatteryManager {
    return context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
  }

  private fun getBatteryInfo(): Map<String, Any?> {
    val intent = getBatteryIntent()
    val manager = getBatteryManager()

    return mapOf(
      "level" to getBatteryLevel(),
      "health" to getHealthStatus(),
      "temperature" to getTemperature(),
      "voltage" to getVoltage(),
      "chargingStatus" to getChargingStatus(),
      "plugType" to getPlugType(),
      "technology" to getTechnology(),
      "currentNow" to getCurrentNow(),
      "currentAverage" to getCurrentAverage(),
      "chargeCounter" to getChargeCounter(),
      "energyCounter" to getEnergyCounter(),
      "designCapacity" to getDesignCapacity(),
      "chargeTimeRemaining" to getChargeTimeRemaining(),
      "cycleCount" to getCycleCount(),
      "isCharging" to isCharging(),
      "isBatteryPresent" to isBatteryPresent()
    )
  }

  private fun getBatteryLevel(): Int {
    val intent = getBatteryIntent() ?: return -1
    val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
    val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, 100)
    return if (level >= 0 && scale > 0) (level * 100 / scale) else -1
  }

  private fun getHealthStatus(): String {
    val intent = getBatteryIntent() ?: return "UNKNOWN"
    return when (intent.getIntExtra(BatteryManager.EXTRA_HEALTH, BatteryManager.BATTERY_HEALTH_UNKNOWN)) {
      BatteryManager.BATTERY_HEALTH_GOOD -> "GOOD"
      BatteryManager.BATTERY_HEALTH_OVERHEAT -> "OVERHEAT"
      BatteryManager.BATTERY_HEALTH_DEAD -> "DEAD"
      BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> "OVER_VOLTAGE"
      BatteryManager.BATTERY_HEALTH_COLD -> "COLD"
      BatteryManager.BATTERY_HEALTH_UNSPECIFIED_FAILURE -> "FAILURE"
      else -> "UNKNOWN"
    }
  }

  private fun getTemperature(): Double {
    val intent = getBatteryIntent() ?: return -1.0
    val temp = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, -1)
    return if (temp >= 0) temp / 10.0 else -1.0
  }

  private fun getVoltage(): Int {
    val intent = getBatteryIntent() ?: return -1
    return intent.getIntExtra(BatteryManager.EXTRA_VOLTAGE, -1)
  }

  private fun getChargingStatus(): String {
    val intent = getBatteryIntent() ?: return "UNKNOWN"
    return when (intent.getIntExtra(BatteryManager.EXTRA_STATUS, BatteryManager.BATTERY_STATUS_UNKNOWN)) {
      BatteryManager.BATTERY_STATUS_CHARGING -> "CHARGING"
      BatteryManager.BATTERY_STATUS_DISCHARGING -> "DISCHARGING"
      BatteryManager.BATTERY_STATUS_FULL -> "FULL"
      BatteryManager.BATTERY_STATUS_NOT_CHARGING -> "NOT_CHARGING"
      else -> "UNKNOWN"
    }
  }

  private fun isCharging(): Boolean {
    val intent = getBatteryIntent() ?: return false
    val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, BatteryManager.BATTERY_STATUS_UNKNOWN)
    return status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL
  }

  private fun getPlugType(): String {
    val intent = getBatteryIntent() ?: return "NONE"
    return when (intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0)) {
      BatteryManager.BATTERY_PLUGGED_AC -> "AC"
      BatteryManager.BATTERY_PLUGGED_USB -> "USB"
      BatteryManager.BATTERY_PLUGGED_WIRELESS -> "WIRELESS"
      else -> "NONE"
    }
  }

  private fun getTechnology(): String {
    val intent = getBatteryIntent() ?: return "UNKNOWN"
    return intent.getStringExtra(BatteryManager.EXTRA_TECHNOLOGY) ?: "UNKNOWN"
  }

  private fun getCurrentNow(): Long {
    val manager = getBatteryManager()
    val current = manager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW)
    return if (current != Int.MIN_VALUE) current.toLong() else 0L
  }

  private fun getCurrentAverage(): Long {
    val manager = getBatteryManager()
    val current = manager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_AVERAGE)
    return if (current != Int.MIN_VALUE) current.toLong() else 0L
  }

  private fun getChargeCounter(): Long {
    val manager = getBatteryManager()
    val counter = manager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CHARGE_COUNTER)
    return if (counter != Int.MIN_VALUE) counter.toLong() else 0L
  }

  private fun getEnergyCounter(): Long {
    val manager = getBatteryManager()
    val energy = manager.getLongProperty(BatteryManager.BATTERY_PROPERTY_ENERGY_COUNTER)
    return if (energy != Long.MIN_VALUE) energy else 0L
  }

  private fun getDesignCapacity(): Int {
    // Try to read from power_profile.xml via reflection
    try {
      val powerProfileClass = Class.forName("com.android.internal.os.PowerProfile")
      val constructor = powerProfileClass.getConstructor(Context::class.java)
      val powerProfile = constructor.newInstance(context)
      val getAveragePower = powerProfileClass.getMethod("getBatteryCapacity")
      val capacity = getAveragePower.invoke(powerProfile) as Double
      return capacity.toInt()
    } catch (e: Exception) {
      // Fallback: try reading from sys filesystem
      return readBatteryCapacityFromSys()
    }
  }

  private fun readBatteryCapacityFromSys(): Int {
    val paths = arrayOf(
      "/sys/class/power_supply/battery/charge_full_design",
      "/sys/class/power_supply/battery/battery_capacity"
    )
    for (path in paths) {
      try {
        val file = File(path)
        if (file.exists()) {
          val reader = BufferedReader(FileReader(file))
          val value = reader.readLine()?.trim()?.toIntOrNull()
          reader.close()
          if (value != null && value > 0) {
            // Convert from microampere-hours to milliampere-hours
            return if (value > 100000) value / 1000 else value
          }
        }
      } catch (e: Exception) {
        continue
      }
    }
    return -1
  }

  private fun getChargeTimeRemaining(): Long {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      val manager = getBatteryManager()
      val time = manager.computeChargeTimeRemaining()
      return if (time >= 0) time else -1L
    }
    return -1L
  }

  private fun getCycleCount(): Int {
    // Try to read cycle count from sys filesystem
    val paths = arrayOf(
      "/sys/class/power_supply/battery/cycle_count",
      "/sys/class/power_supply/bms/cycle_count"
    )
    for (path in paths) {
      try {
        val file = File(path)
        if (file.exists()) {
          val reader = BufferedReader(FileReader(file))
          val value = reader.readLine()?.trim()?.toIntOrNull()
          reader.close()
          if (value != null && value >= 0) {
            return value
          }
        }
      } catch (e: Exception) {
        continue
      }
    }
    return -1
  }

  private fun isBatteryPresent(): Boolean {
    val intent = getBatteryIntent() ?: return false
    return intent.getBooleanExtra(BatteryManager.EXTRA_PRESENT, false)
  }
}
