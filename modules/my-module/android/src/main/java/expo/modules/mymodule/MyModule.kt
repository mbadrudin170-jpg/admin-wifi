package expo.modules.mymodule

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.ConnectivityManager
import java.net.Inet4Address
import android.net.LinkProperties
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.os.Build
import android.os.SystemClock
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {

  private companion object {
    const val LOG_TAG = "MyModule"
    const val LOG_EVENT = "onNativeLog"
  }

  private fun nativeLog(
    level: String,
    function: String,
    message: String,
    details: Map<String, Any?> = emptyMap(),
    error: Throwable? = null
  ) {
    val formatted = "[$function] $message"

    when (level) {
      "VERBOSE" -> Log.v(LOG_TAG, formatted)
      "DEBUG" -> Log.d(LOG_TAG, formatted)
      "INFO" -> Log.i(LOG_TAG, formatted)
      "WARN" -> Log.w(LOG_TAG, formatted)
      "ERROR" -> {
        if (error != null) {
          Log.e(LOG_TAG, formatted, error)
        } else {
          Log.e(LOG_TAG, formatted)
        }
      }
    }

    val payload = mutableMapOf<String, Any?>(
      "level" to level,
      "tag" to LOG_TAG,
      "function" to function,
      "message" to message,
      "timestamp" to System.currentTimeMillis()
    )

    if (details.isNotEmpty()) {
      payload["details"] = details
    }

    if (error != null) {
      payload["error"] = error.toString()
    }

    try {
      sendEvent(LOG_EVENT, payload)
    } catch (exception: Exception) {
      Log.w(LOG_TAG, "Gagal meneruskan log ke JavaScript", exception)
    }
  }

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

  private fun inetToInt(address: Inet4Address): Long {
    val bytes = address.address
    return ((bytes[0].toLong() and 0xFFL) shl 24) or
      ((bytes[1].toLong() and 0xFFL) shl 16) or
      ((bytes[2].toLong() and 0xFFL) shl 8) or
      (bytes[3].toLong() and 0xFFL)
  }

  private fun intToBytes(value: Int): ByteArray {
    return byteArrayOf(
      ((value shr 24) and 0xFF).toByte(),
      ((value shr 16) and 0xFF).toByte(),
      ((value shr 8) and 0xFF).toByte(),
      (value and 0xFF).toByte()
    )
  }

  override fun definition() = ModuleDefinition {
    Name("MyModule")

    Events("onScanResults", "onNativeLog")

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
      val startedAt = SystemClock.elapsedRealtime()
      nativeLog("INFO", "getConnectedDevices", "Fungsi dipanggil")
      try {
      val devices = mutableListOf<Map<String, Any?>>()
      val seen = mutableSetOf<String>()

      fun tambah(ip: String, mac: String, sumber: String) {
        val normalizedMac = mac.lowercase()

        val validMac = Regex(
          "^[0-9a-f]{2}(:[0-9a-f]{2}){5}$"
        ).matches(normalizedMac)

        if (!validMac) return
        if (normalizedMac == "00:00:00:00:00:00") return
        if (normalizedMac == "ff:ff:ff:ff:ff:ff") return

        if (seen.add(ip)) {
          devices.add(
            mapOf(
              "ip" to ip,
              "mac" to normalizedMac,
              "sumber" to sumber
            )
          )
          nativeLog(
            "DEBUG",
            "getConnectedDevices",
            "Perangkat ditemukan",
            mapOf("sumber" to sumber, "ip" to ip, "mac" to normalizedMac)
          )
        }
      }

      // Parser ip neigh
      fun parseNeighborLine(line: String, iface: String?) {
        val parts = line.trim().split(Regex("\\s+"))

        if (parts.size < 4 || parts[0] == "IP") return
        if (parts[1] != "dev") return
        if (iface != null && parts[2] != iface) return

        val macIndex = parts.indexOf("lladdr")
        if (macIndex == -1 || macIndex + 1 >= parts.size) return

        val state = parts.getOrElse(macIndex + 2) { "" }
        if (state == "FAILED" || state == "INCOMPLETE") return

        tambah(parts[0], parts[macIndex + 1], "ip neigh")
      }

      // Validasi jaringan Wi-Fi dan ambil informasi jaringan.
      val context = appContext.reactContext?.applicationContext
        ?: throw IllegalStateException("React context tidak tersedia")

      val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

      val network = connectivityManager.activeNetwork
        ?: throw IllegalStateException("Tidak ada jaringan aktif")

      val capabilities = connectivityManager.getNetworkCapabilities(network)
        ?: throw IllegalStateException("Informasi jaringan tidak tersedia")

      if (
        !capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_VPN)
      ) {
        throw IllegalStateException("Jaringan aktif bukan koneksi Wi-Fi langsung")
      }

      val linkProperties = connectivityManager.getLinkProperties(network)
        ?: throw IllegalStateException("Informasi Wi-Fi tidak tersedia")

      val iface = linkProperties.interfaceName
      val ipv4 = linkProperties.linkAddresses
        .map { it.address }
        .firstOrNull { it is Inet4Address } as? Inet4Address
        ?: throw IllegalStateException("Alamat IPv4 Wi-Fi tidak ditemukan")

      val prefixLength = linkProperties.linkAddresses
        .firstOrNull { it.address == ipv4 }
        ?.prefixLength ?: 24

      val gateway = linkProperties.routes
        .firstOrNull { it.isDefaultRoute }
        ?.gateway
        ?.hostAddress

      nativeLog(
        "INFO",
        "getConnectedDevices",
        "Wi-Fi aktif",
        mapOf(
          "iface" to (iface ?: ""),
          "ip" to ipv4.toString(),
          "prefix" to prefixLength,
          "gateway" to (gateway ?: "")
        )
      )

      // Neighbor table sebagai sumber utama.
      fun jalankanNeighbor(cmd: Array<String>) {
        try {
          val process = Runtime.getRuntime().exec(cmd)
          process.inputStream.bufferedReader().forEachLine {
            parseNeighborLine(it, iface)
          }
          process.waitFor()
          nativeLog(
            "DEBUG",
            "getConnectedDevices",
            "Neighbor selesai",
            mapOf("command" to cmd.joinToString(" "))
          )
        } catch (e: Exception) {
          nativeLog(
            "WARN",
            "getConnectedDevices",
            "Gagal menjalankan neighbor",
            mapOf("command" to cmd.joinToString(" "), "error" to (e.message ?: ""))
          )
        }
      }

      jalankanNeighbor(
        arrayOf("ip", "-4", "neigh", "show", "dev", iface ?: "wlan0")
      )

      // Ping sweep untuk mengisi neighbor cache, lalu baca ulang.
      try {
        val ipLong = inetToInt(ipv4)
        val hostBits = 32 - prefixLength.coerceIn(0, 32)
        val mask = if (prefixLength == 0) {
          0L
        } else {
          (0xFFFF_FFFFL shl hostBits) and 0xFFFF_FFFFL
        }
        val networkAddress = ipLong and mask
        val broadcastAddress = networkAddress or (0xFFFF_FFFFL ushr prefixLength)
        val firstHost = if (prefixLength <= 30) networkAddress + 1 else networkAddress
        val lastHost = if (prefixLength <= 30) broadcastAddress - 1 else broadcastAddress
        val totalHosts = (lastHost - firstHost + 1).coerceAtLeast(0)
        val hostCount = totalHosts.coerceAtMost(1024)

        nativeLog(
          "DEBUG",
          "getConnectedDevices",
          "Ping sweep",
          mapOf("hostCount" to hostCount, "totalHosts" to totalHosts, "prefix" to prefixLength)
        )

        if (hostCount > 0) {
          val pool = java.util.concurrent.Executors.newFixedThreadPool(32)
          val futures = (0 until hostCount).map { i ->
            pool.submit<Boolean> {
              try {
                val hostInt = firstHost + i
                if (hostInt == ipLong) return@submit false
                java.net.InetAddress.getByAddress(
                  intToBytes(hostInt.toInt())
                ).isReachable(200)
              } catch (_: Exception) {
                false
              }
            }
          }
          futures.forEach { runCatching { it.get() } }
          pool.shutdown()

          // Baca ulang neighbor table setelah ping sweep.
          jalankanNeighbor(
            arrayOf("ip", "-4", "neigh", "show", "dev", iface ?: "wlan0")
          )
        }
      } catch (e: Exception) {
        nativeLog("WARN", "getConnectedDevices", "Ping sweep gagal", mapOf("error" to (e.message ?: "")))
      }

      nativeLog("INFO", "getConnectedDevices", "Discovery selesai", mapOf("jumlahPerangkat" to devices.size))
      devices
    } catch (error: Exception) {
      nativeLog("ERROR", "getConnectedDevices", "Discovery gagal", error = error)
      throw error
    } finally {
      nativeLog("DEBUG", "getConnectedDevices", "Fungsi selesai", mapOf("durasiMs" to (SystemClock.elapsedRealtime() - startedAt)))
    }
    }
    AsyncFunction("scanWifi") {
      val startedAt = SystemClock.elapsedRealtime()
      nativeLog("INFO", "scanWifi", "Fungsi dipanggil")
      try {
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

      nativeLog(
        "INFO",
        "scanWifi",
        "Permintaan pemindaian dikirim",
        mapOf("started" to started)
      )

      mapOf(
        "started" to started,
        "message" to if (started) {
          "Permintaan pemindaian berhasil dikirim"
        } else {
          "Pemindaian ditolak atau dibatasi Android"
        }
      ) } catch (error: Exception) {
        nativeLog("ERROR", "scanWifi", "Pemindaian gagal", error = error)
        throw error
      } finally {
        nativeLog("DEBUG", "scanWifi", "Fungsi selesai", mapOf("durasiMs" to (SystemClock.elapsedRealtime() - startedAt)))
      }
    }
  }
}