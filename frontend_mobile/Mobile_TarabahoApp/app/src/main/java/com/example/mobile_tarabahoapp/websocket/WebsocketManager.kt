package com.example.mobile_tarabahoapp.websocket


import android.os.Handler
import android.os.Looper
import android.util.Log
import io.reactivex.disposables.CompositeDisposable
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import ua.naiksoftware.stomp.Stomp
import ua.naiksoftware.stomp.LifecycleEvent
import ua.naiksoftware.stomp.StompHeader
import ua.naiksoftware.stomp.client.StompClient


class WebsocketManager(
    private val bookingId: Long,
    private val token: String
) {

    private var stompClient: StompClient? = null
    private val disposables = CompositeDisposable()
    private val reconnectHandler = Handler(Looper.getMainLooper())

    private val _messagesFlow = MutableSharedFlow<String>(extraBufferCapacity = 10)
    val messagesFlow: SharedFlow<String> = _messagesFlow

    private var isConnected = false
    private var reconnectAttempts = 0
    private val maxReconnectAttempts = 5
    private val reconnectDelay = 5000L // 5 seconds
    //val websocketUrl = "wss://tarabaho-backend.onrender.com/chat"
    fun connect() {
        val websocketUrl = "ws://10.0.2.2:8080/chat" // Android emulator
        stompClient = Stomp.over(Stomp.ConnectionProvider.OKHTTP, websocketUrl)
        val headers = listOf(
            StompHeader("Authorization", "Bearer $token"),
            StompHeader("accept-version", "1.1,1.2")
        )
        stompClient?.connect(headers)

        stompClient?.lifecycle()?.subscribe({ lifecycleEvent ->
            Log.d("WebSocket", "Lifecycle Event: ${lifecycleEvent.type}")
            when (lifecycleEvent.type) {
                LifecycleEvent.Type.OPENED -> {
                    isConnected = true
                    reconnectAttempts = 0
                    Log.d("WebSocket", "Connected to WebSocket server")

                    // ✅ NOW subscribe to the topic
                    stompClient?.topic("/topic/booking/$bookingId")?.subscribe({ stompMessage ->
                        Log.d("WebSocket", "Received message: ${stompMessage.payload}")
                        _messagesFlow.tryEmit(stompMessage.payload)
                    }, { error ->
                        Log.e("WebSocket", "Topic subscription error: ${error.message}")
                    })
                }

                LifecycleEvent.Type.CLOSED, LifecycleEvent.Type.ERROR -> {
                    isConnected = false
                    Log.d("WebSocket", "Disconnected or error in WebSocket")
                    Log.e("WebSocket", "Error details: ${lifecycleEvent.exception?.message}", lifecycleEvent.exception)
                    attemptReconnect()
                }

                else -> {}
            }
        }, { error ->
            Log.e("WebSocket", "Lifecycle fatal error: ${error.message}", error)
            attemptReconnect()
        })
    }

    private fun attemptReconnect() {
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            Log.d("WebSocket", "Attempting to reconnect... ($reconnectAttempts/$maxReconnectAttempts)")
            reconnectHandler.postDelayed({
                connect()
            }, reconnectDelay)
        } else {
            Log.e("WebSocket", "Max reconnect attempts reached. Giving up.")
        }
    }

    fun sendMessage(content: String) {
        if (isConnected) {
            val messageJson = """
                {
                    "bookingId": $bookingId,
                    "content": "$content"
                }
            """.trimIndent()

            stompClient?.send("/app/chat/$bookingId", messageJson)?.subscribe({
                Log.d("WebSocket", "Message sent successfully")
            }, { error ->
                Log.e("WebSocket", "Error sending message: ${error.message}")
            })
        } else {
            Log.w("WebSocket", "Cannot send message: Not connected")
        }
    }

    fun disconnect() {
        reconnectHandler.removeCallbacksAndMessages(null)
        disposables.clear()
        stompClient?.disconnect()
        isConnected = false
        Log.d("WebSocket", "Disconnected")
    }
}