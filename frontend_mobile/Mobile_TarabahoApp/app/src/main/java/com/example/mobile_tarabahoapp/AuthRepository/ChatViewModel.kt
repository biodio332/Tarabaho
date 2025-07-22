import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.model.MessageDTO
import com.example.mobile_tarabahoapp.model.SendMessageRequest
import com.example.mobile_tarabahoapp.websocket.WebsocketManager
import com.google.gson.Gson
import com.google.gson.JsonSyntaxException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import android.util.Log

class ChatViewModel(
    private val bookingId: Long,
    private val token: String
) : ViewModel() {

    private val gson = Gson()
    private val TAG = "ChatViewModel"

    private val _messages = MutableStateFlow<List<MessageDTO>>(emptyList())
    val messages: StateFlow<List<MessageDTO>> = _messages.asStateFlow()

    private val _connectionState = MutableStateFlow(ConnectionState.DISCONNECTED)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    private val websocketManager = WebsocketManager(bookingId, token)
    private val apiService = RetrofitClient.apiService

    init {
        // Collect real-time messages from WebSocket
        viewModelScope.launch(Dispatchers.IO) {
            websocketManager.messagesFlow.collectLatest { jsonPayload ->
                try {
                    val message = gson.fromJson(jsonPayload, MessageDTO::class.java)
                    // Add new message, avoid duplicates, and sort by sentAt
                    _messages.value = (_messages.value + message)
                        .distinctBy { it.id }
                        .sortedByDescending { it.sentAt }
                    Log.d(TAG, "Received WebSocket message: $message")
                } catch (e: JsonSyntaxException) {
                    Log.e(TAG, "Error parsing message JSON: ${e.message}")
                }
            }
        }
    }

    fun connect() {
        _connectionState.value = ConnectionState.CONNECTING
        viewModelScope.launch(Dispatchers.IO) {
            try {
                // Fetch historical messages
                val response = apiService.getMessages(bookingId)
                if (response.isSuccessful) {
                    val historicalMessages = response.body() ?: emptyList()
                    _messages.value = historicalMessages
                        .distinctBy { it.id }
                        .sortedByDescending { it.sentAt }
                    Log.d(TAG, "Fetched ${historicalMessages.size} messages for bookingId: $bookingId")
                } else {
                    Log.e(TAG, "Failed to fetch messages: ${response.errorBody()?.string()}")
                    _connectionState.value = ConnectionState.ERROR
                }

                // Connect to WebSocket
                websocketManager.connect()
                _connectionState.value = ConnectionState.CONNECTED
                Log.d(TAG, "WebSocket connected for bookingId: $bookingId")
            } catch (e: Exception) {
                Log.e(TAG, "Connection error: ${e.message}")
                _connectionState.value = ConnectionState.ERROR
            }
        }
    }

    fun disconnect() {
        viewModelScope.launch(Dispatchers.IO) {
            websocketManager.disconnect()
            _connectionState.value = ConnectionState.DISCONNECTED
            Log.d(TAG, "WebSocket disconnected for bookingId: $bookingId")
        }
    }

    fun sendMessage(content: String) {
        if (content.isBlank()) return

        viewModelScope.launch(Dispatchers.IO) {
            try {
                if (_connectionState.value == ConnectionState.CONNECTED) {
                    // Send via WebSocket
                    websocketManager.sendMessage(content)
                    Log.d(TAG, "Sent message via WebSocket: $content for bookingId: $bookingId")
                } else {
                    // Fallback to REST API
                    val request = SendMessageRequest(bookingId = bookingId, content = content)
                    val response = apiService.sendMessage(request)
                    if (response.isSuccessful) {
                        val sentMessage = response.body()
                        if (sentMessage != null) {
                            _messages.value = (_messages.value + sentMessage)
                                .distinctBy { it.id }
                                .sortedByDescending { it.sentAt }
                            Log.d(TAG, "Sent message via REST: $sentMessage")
                        }
                    } else {
                        Log.e(TAG, "Failed to send message via REST: ${response.errorBody()?.string()}")
                        _connectionState.value = ConnectionState.ERROR
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send message: ${e.message}")
                _connectionState.value = ConnectionState.ERROR
            }
        }
    }

    fun retryConnection() {
        disconnect()
        connect()
    }

    override fun onCleared() {
        super.onCleared()
        disconnect()
        Log.d(TAG, "ChatViewModel cleared for bookingId: $bookingId")
    }

    enum class ConnectionState {
        DISCONNECTED,
        CONNECTING,
        CONNECTED,
        ERROR
    }
}