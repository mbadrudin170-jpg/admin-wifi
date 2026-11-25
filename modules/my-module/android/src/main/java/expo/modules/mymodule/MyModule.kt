package expo.modules.mymodule

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.wifi.WifiManager
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {

  private var scanReceiver: BroadcastReceiver? = null
  private var receiverContext: Context? = null

  private fun checkLocationPermission(context: Context) {
    if (
      context.checkSelfPermission(
        Manifest.permission.ACCESS_FINE_LOCATION
      ) != PackageManager.PERMISSION_GRANTED
    ) {
      throw SecurityException(
        "Izin ACCESS_FINE_LOCATION belum diberikan"
      )
    }
  }

  private fun getWifiManager(context: Context): WifiManager {
    return context.getSystemService(Context.WIFI_SERVICE)
      as? WifiManager
      ?: throw IllegalStateException("WifiManager tidak tersedia")
  }

  private fun isLocationEnabled(context: Context): Boolean {
    val manager = context.getSystemService(
      Context.LOCATION_SERVICE
    ) as LocationManager

    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      manager.isLocationEnabled
    } else {
      @Suppress("DEPRECATION")
      manager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
        manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
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

  private fun getWifiNetworks(
    context: Context
  ): List<Map<String, Any?>> {
    checkLocationPermission(context)

    return getWifiManager(context).scanResults.map { result ->
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

  private fun registerScanReceiver() {
    if (scanReceiver != null) return

    val context = appContext.reactContext?.applicationContext
      ?: return

    val receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != WifiManager.SCAN_RESULTS_AVAILABLE_ACTION) {
          return
        }

        val updated = intent.getBooleanExtra(
          WifiManager.EXTRA_RESULTS_UPDATED,
          false
        )

        val networks: List<Map<String, Any?>> =
          if (updated) {
            try {
              getWifiNetworks(context.applicationContext)
            } catch (error: SecurityException) {
              emptyList()
            }
          } else {
            emptyList()
          }

        sendEvent(
          "onScanResults",
          mapOf(
            "success" to updated,
            "message" to if (updated) {
              "Pemindaian Wi-Fi berhasil"
            } else {
              "Pemindaian gagal atau hasil terbaru belum tersedia"
            },
            "networks" to networks
          )
        )
      }
    }

    val filter = IntentFilter(
      WifiManager.SCAN_RESULTS_AVAILABLE_ACTION
    )

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      context.registerReceiver(
        receiver,
        filter,
        Context.RECEIVER_EXPORTED
      )
    } else {
      @Suppress("DEPRECATION")
      context.registerReceiver(receiver, filter)
    }

    scanReceiver = receiver
    receiverContext = context
  }

  private fun unregisterScanReceiver() {
    val context = receiverContext
    val receiver = scanReceiver

    if (context != null && receiver != null) {
      try {
        context.unregisterReceiver(receiver)
      } catch (error: IllegalArgumentException) {
        // Receiver mungkin sudah dilepas oleh sistem.
      }
    }

    scanReceiver = null
    receiverContext = null
  }

  override fun definition() = ModuleDefinition {
    Name("MyModule")

    Events("onScanResults")

    OnStartObserving("onScanResults") {
      registerScanReceiver()
    }

    OnStopObserving("onScanResults") {
      unregisterScanReceiver()
    }

    OnDestroy {
      unregisterScanReceiver()
    }

    AsyncFunction("getConnectedDevices") {
      val devices = mutableListOf<Map<String, Any?>>()
      try {
        java.io.File("/proc/net/arp").forEachLine { line ->
          val parts = line.trim().split(Regex("\\s+"))
          if (parts.size >= 4 && parts[0] != "IP") {
            val ip = parts[0]
            val mac = parts[3]
            if (mac != "00:00:00:00:00:00" && mac.contains(":")) {
              devices.add(mapOf("ip" to ip, "mac" to mac))
            }
          }
        }
      } catch (e: Exception) {
        // ignore
      }
      devices
    }
    AsyncFunction("scanWifi") {
      val context = appContext.reactContext?.applicationContext
        ?: throw IllegalStateException("React context tidak tersedia")

      checkLocationPermission(context)

      if (!isLocationEnabled(context)) {
        throw IllegalStateException(
          "Layanan lokasi perangkat belum aktif"
        )
      }

      val wifiManager = getWifiManager(context)

      @Suppress("DEPRECATION")
      val wifiEnabled = wifiManager.isWifiEnabled

      if (!wifiEnabled) {
        throw IllegalStateException("Wi-Fi belum aktif")
      }

      @Suppress("DEPRECATION")
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
  }
}
