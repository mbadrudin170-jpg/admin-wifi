package expo.modules.mymodule

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.wifi.WifiManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {

  private fun getWifiManager(): WifiManager {
    val context = appContext.reactContext
      ?: throw IllegalStateException("React context tidak tersedia")

    return context.applicationContext
      .getSystemService(Context.WIFI_SERVICE) as WifiManager
  }

  private fun checkLocationPermission() {
    val context = appContext.reactContext
      ?: throw IllegalStateException("React context tidak tersedia")

    if (context.checkSelfPermission(
        Manifest.permission.ACCESS_FINE_LOCATION
      ) != PackageManager.PERMISSION_GRANTED
    ) {
      throw SecurityException("Izin ACCESS_FINE_LOCATION belum diberikan")
    }
  }

  private fun frequencyToChannel(frequency: Int): Int {
    return when {
      frequency == 2484 -> 14
      frequency in 2412..2472 -> (frequency - 2407) / 5
      frequency in 5000..5895 -> (frequency - 5000) / 5
      frequency in 5955..7115 -> (frequency - 5950) / 5
      else -> -1
    }
  }

  override fun definition() = ModuleDefinition {
    Name("MyModule")

    AsyncFunction("scanWifi") {
      checkLocationPermission()

      val context = appContext.reactContext
        ?: throw IllegalStateException("React context tidak tersedia")

      val locationManager = context.getSystemService(
        Context.LOCATION_SERVICE
      ) as LocationManager

      if (!locationManager.isLocationEnabled) {
        throw IllegalStateException("Layanan lokasi perangkat belum aktif")
      }

      val wifiManager = getWifiManager()

      if (!wifiManager.isWifiEnabled) {
        throw IllegalStateException("Wi-Fi belum aktif")
      }

      val started = wifiManager.startScan()

      mapOf(
        "started" to started,
        "message" to if (started) {
          "Permintaan pemindaian berhasil dikirim"
        } else {
          "Pemindaian ditolak atau dibatasi Android"
        }
      )
    }

    AsyncFunction("getScanResults") {
      checkLocationPermission()

      getWifiManager().scanResults.map { result ->
        mapOf(
          "ssid" to result.SSID,
          "bssid" to result.BSSID,
          "rssi" to result.level,
          "frequency" to result.frequency,
          "channel" to frequencyToChannel(result.frequency),
          "capabilities" to result.capabilities
        )
      }
    }
  }
}
