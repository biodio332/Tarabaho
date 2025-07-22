import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mobile_tarabahoapp.model.MessageDTO
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import androidx.navigation.NavController
import com.example.mobile_tarabahoapp.utils.TokenManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessagesScreen(
    navController: NavController,
    chatViewModel: ChatViewModel,
    modifier: Modifier = Modifier
) {
    val backStackEntry = navController.currentBackStackEntry
    val currentUserId = backStackEntry?.arguments?.getLong("currentUserId") ?: TokenManager.getCurrentUserId()
    val isWorker = backStackEntry?.arguments?.getBoolean("isWorker") ?: TokenManager.isWorker()
    val chatTitle = backStackEntry?.arguments?.getString("chatTitle") ?: "Chat"

    val actualWorkerId = TokenManager.getWorkerId()
    val actualUserId = TokenManager.getUserId()

    val messages by chatViewModel.messages.collectAsState()
    val connectionState by chatViewModel.connectionState.collectAsState()
    var inputText by remember { mutableStateOf("") }
    val keyboardController = LocalSoftwareKeyboardController.current
    val listState = rememberLazyListState()

    // Scroll to bottom when new messages arrive
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(0)
        }
    }

    // Connect to chat when the screen loads
    LaunchedEffect(Unit) {
        chatViewModel.connect()
    }

    // Clean up when the screen is dismissed
    DisposableEffect(Unit) {
        onDispose {
            chatViewModel.disconnect()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = chatTitle,
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = when (connectionState) {
                                ChatViewModel.ConnectionState.CONNECTED -> "Online"
                                ChatViewModel.ConnectionState.CONNECTING -> "Connecting..."
                                ChatViewModel.ConnectionState.DISCONNECTED -> "Offline"
                                ChatViewModel.ConnectionState.ERROR -> "Connection error"
                            },
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 12.sp
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.navigateUp() }) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF2962FF)
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF5F5F5))
        ) {
            // Connection status bar
            ConnectionStatusBar(connectionState, onRetryClick = { chatViewModel.retryConnection() })

            // Messages list
            Box(modifier = Modifier.weight(1f)) {
                if (messages.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                "No messages yet",
                                fontSize = 16.sp,
                                color = Color.Gray,
                                fontWeight = FontWeight.Medium
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "Start the conversation!",
                                fontSize = 14.sp,
                                color = Color.Gray
                            )
                        }
                    }
                }
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    reverseLayout = true,
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(messages) { message ->
                        val isCurrentUser = isMessageFromCurrentUser(
                            message = message,
                            isCurrentUserWorker = isWorker,
                            actualWorkerId = actualWorkerId,
                            actualUserId = actualUserId
                        )

                        MessageItem(
                            message = message,
                            isCurrentUser = isCurrentUser
                        )
                    }
                }
            }

            // Message input area
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        modifier = Modifier.weight(1f),
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = {
                            Text(
                                "Type a message...",
                                color = Color.Gray
                            )
                        },
                        maxLines = 4,
                        singleLine = false,
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF),
                            unfocusedContainerColor = Color(0xFFF8F9FA),
                            focusedContainerColor = Color(0xFFF8F9FA)
                        ),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(
                            onSend = {
                                if (inputText.isNotBlank() && connectionState == ChatViewModel.ConnectionState.CONNECTED) {
                                    chatViewModel.sendMessage(inputText.trim())
                                    inputText = ""
                                    keyboardController?.hide()
                                }
                            }
                        )
                    )

                    FloatingActionButton(
                        onClick = {
                            if (inputText.isNotBlank() && connectionState == ChatViewModel.ConnectionState.CONNECTED) {
                                chatViewModel.sendMessage(inputText.trim())
                                inputText = ""
                                keyboardController?.hide()
                            }
                        },
                        modifier = Modifier.size(48.dp),
                        containerColor = if (inputText.isNotBlank() && connectionState == ChatViewModel.ConnectionState.CONNECTED)
                            Color(0xFF2962FF) else Color.Gray,
                        elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "Send message",
                            tint = Color.White
                        )
                    }
                }
            }
        }
    }
}

fun isMessageFromCurrentUser(
    message: MessageDTO,
    isCurrentUserWorker: Boolean,
    actualWorkerId: Long?,
    actualUserId: Long?
): Boolean {
    return if (isCurrentUserWorker) {
        actualWorkerId != null && message.senderWorkerId == actualWorkerId
    } else {
        actualUserId != null && message.senderUserId == actualUserId
    }
}

fun formatTimestamp(isoString: String): String {
    return try {
        val instant = Instant.parse(isoString)
        val formatter = DateTimeFormatter.ofPattern("hh:mm a")
            .withZone(ZoneId.systemDefault())
        formatter.format(instant)
    } catch (e: Exception) {
        isoString.take(16)
    }
}

@Composable
fun ConnectionStatusBar(
    connectionState: ChatViewModel.ConnectionState,
    onRetryClick: () -> Unit
) {
    when (connectionState) {
        ChatViewModel.ConnectionState.CONNECTING -> {
            LinearProgressIndicator(
                modifier = Modifier.fillMaxWidth(),
                color = Color(0xFF2962FF)
            )
        }
        ChatViewModel.ConnectionState.ERROR -> {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFFFEBEE))
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Connection error",
                    color = Color(0xFFD32F2F),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
                TextButton(onClick = onRetryClick) {
                    Text(
                        "Retry",
                        color = Color(0xFFD32F2F),
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
        ChatViewModel.ConnectionState.DISCONNECTED -> {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF3E0))
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Disconnected",
                    color = Color(0xFFFF9800),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
                TextButton(onClick = onRetryClick) {
                    Text(
                        "Connect",
                        color = Color(0xFFFF9800),
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
        else -> {} // No indicator for connected state
    }
}

@Composable
fun MessageItem(
    message: MessageDTO,
    isCurrentUser: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp),
        horizontalArrangement = if (isCurrentUser) Arrangement.End else Arrangement.Start
    ) {
        // Messages from other users (left side)
        if (!isCurrentUser) {
            Column(
                modifier = Modifier
                    .weight(1f, fill = false)
                    .padding(end = 16.dp),
                horizontalAlignment = Alignment.Start
            ) {
                // Sender name
                Text(
                    text = message.senderName,
                    style = MaterialTheme.typography.labelMedium,
                    color = Color(0xFF2962FF),
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 4.dp, start = 4.dp)
                )

                // Message bubble (grey for other party)
                Card(
                    shape = RoundedCornerShape(
                        topStart = 12.dp,
                        topEnd = 12.dp,
                        bottomStart = 4.dp,
                        bottomEnd = 12.dp
                    ),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFE0E0E0)
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Text(
                        text = message.content,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Black,
                        modifier = Modifier
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                            .widthIn(max = 260.dp),
                        lineHeight = 20.sp
                    )
                }

                // Timestamp
                Text(
                    text = formatTimestamp(message.sentAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    modifier = Modifier.padding(start = 8.dp, top = 2.dp)
                )
            }
            Spacer(modifier = Modifier.weight(1f))
        }

        // Messages from the current user (right side)
        if (isCurrentUser) {
            Spacer(modifier = Modifier.weight(1f))
            Column(
                modifier = Modifier
                    .weight(1f, fill = false)
                    .padding(start = 16.dp),
                horizontalAlignment = Alignment.End
            ) {
                // Current user label
                Text(
                    text = "You",
                    style = MaterialTheme.typography.labelMedium,
                    color = Color(0xFF2962FF),
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 4.dp, end = 4.dp)
                )

                // Message bubble (blue for current user)
                Card(
                    shape = RoundedCornerShape(
                        topStart = 12.dp,
                        topEnd = 12.dp,
                        bottomStart = 12.dp,
                        bottomEnd = 4.dp
                    ),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF2962FF)
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Text(
                        text = message.content,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White,
                        modifier = Modifier
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                            .widthIn(max = 260.dp),
                        lineHeight = 20.sp
                    )
                }

                // Timestamp
                Text(
                    text = formatTimestamp(message.sentAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    modifier = Modifier.padding(end = 8.dp, top = 2.dp),
                    textAlign = TextAlign.End
                )
            }
        }
    }
}