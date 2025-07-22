import android.util.Log
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.mobile_tarabahoapp.AuthRepository.BookingViewModel
import com.example.mobile_tarabahoapp.ui.theme.TarabahoTheme
import com.example.mobile_tarabahoapp.utils.TokenManager
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkerBookingDetailsScreen(
    navController: NavController,
    bookingId: Long
) {
    val viewModel: BookingViewModel = viewModel()
    val booking by viewModel.selectedBooking.observeAsState()
    val coroutineScope = rememberCoroutineScope()

    // State for dialogs and amount input
    var showConfirmDialog by remember { mutableStateOf(false) }
    var confirmAction by remember { mutableStateOf<() -> Unit>({}) }
    var confirmTitle by remember { mutableStateOf("") }
    var confirmMessage by remember { mutableStateOf("") }
    var confirmButtonText by remember { mutableStateOf("") }
    var confirmButtonColor by remember { mutableStateOf(Color(0xFF2962FF)) }
    var showPaymentDialog by remember { mutableStateOf(false) }
    var showPaymentConfirmDialog by remember { mutableStateOf(false) }
    var showCompletePaymentDialog by remember { mutableStateOf(false) }
    var amountInput by remember { mutableStateOf("") }
    var amountError by remember { mutableStateOf<String?>(null) }
    var showEarnedAnimation by remember { mutableStateOf(false) }
    var earnedAmount by remember { mutableStateOf(0.0) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Animation for earned amount
    val animationAlpha by animateFloatAsState(
        targetValue = if (showEarnedAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 1000, easing = LinearEasing)
    )
    val animationScale by animateFloatAsState(
        targetValue = if (showEarnedAnimation) 1f else 0.5f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioLowBouncy, stiffness = Spring.StiffnessLow)
    )

    LaunchedEffect(bookingId) {
        while (true) {
            viewModel.getBookingById(bookingId)
            delay(3000) // Every 3 seconds
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Booking Details",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.navigateUp() }) {
                        Icon(
                            Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF2962FF)),
            )
        }
    ) { paddingValues ->
        if (booking == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator(color = Color(0xFF2962FF))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Loading booking details...",
                        color = Color.Gray,
                        fontSize = 16.sp
                    )
                }
            }
        } else {
            val bookingDetail = booking!!
            val status = bookingDetail.status
            val canAcceptOrReject = status == "PENDING"
            val canStart = status == "ACCEPTED"
            val canComplete = status == "IN_PROGRESS"
            val canChat = status in listOf("ACCEPTED", "IN_PROGRESS", "WORKER_COMPLETED", "COMPLETED")
            val canConfirmPayment = status == "COMPLETED" && bookingDetail.paymentConfirmationStatus == "PENDING"

            // Format dates
            val dateFormat = SimpleDateFormat("MMM dd, yyyy, hh:mm a", Locale.getDefault())
            val createdAtFormatted = try {
                dateFormat.format(bookingDetail.createdAt)
            } catch (e: Exception) {
                bookingDetail.createdAt.toString()
            }

            val updatedAtFormatted = bookingDetail.updatedAt?.let {
                try {
                    dateFormat.format(it)
                } catch (e: Exception) {
                    it.toString()
                }
            } ?: "N/A"

            // Added amount and paymentConfirmationStatus
            val paymentStatus = bookingDetail.paymentConfirmationStatus ?: "Not set"
            val amount = bookingDetail.amount?.let { "₱%.2f".format(it) } ?: "Not set"

            // Status color
            val statusColor = when (status) {
                "PENDING" -> Color(0xFFFFA000)
                "ACCEPTED" -> Color(0xFF2962FF)
                "IN_PROGRESS" -> Color(0xFF7B1FA2)
                "WORKER_COMPLETED" -> Color(0xFF388E3C)
                "COMPLETED" -> Color(0xFF388E3C)
                "REJECTED" -> Color(0xFFD32F2F)
                else -> Color.Gray
            }

            val statusBgColor = when (status) {
                "PENDING" -> Color(0xFFFFF3E0)
                "ACCEPTED" -> Color(0xFFE3F2FD)
                "IN_PROGRESS" -> Color(0xFFF3E5F5)
                "WORKER_COMPLETED" -> Color(0xFFE8F5E9)
                "COMPLETED" -> Color(0xFFE8F5E9)
                "REJECTED" -> Color(0xFFFFEBEE)
                else -> Color(0xFFF5F5F5)
            }

            val statusIcon = when (status) {
                "PENDING" -> Icons.Default.Schedule
                "ACCEPTED" -> Icons.Default.CheckCircle
                "IN_PROGRESS" -> Icons.Default.Pending
                "WORKER_COMPLETED" -> Icons.Default.CheckCircle
                "COMPLETED" -> Icons.Default.Done
                "REJECTED" -> Icons.Default.Cancel
                else -> Icons.Default.Info
            }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0xFFF5F5F5))
                        .verticalScroll(rememberScrollState())
                ) {
                    // Updated Status Card to show paymentConfirmationStatus
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = statusBgColor),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = statusIcon,
                                    contentDescription = null,
                                    tint = statusColor,
                                    modifier = Modifier.size(32.dp)
                                )

                                Spacer(modifier = Modifier.width(16.dp))

                                Column {
                                    Text(
                                        text = "Status",
                                        fontSize = 14.sp,
                                        color = Color.Gray
                                    )

                                    Text(
                                        text = status,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = statusColor
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Verified,
                                    contentDescription = null,
                                    tint = if (paymentStatus == "CONFIRMED") Color(0xFF4CAF50) else Color(0xFFFF9800),
                                    modifier = Modifier.size(32.dp)
                                )

                                Spacer(modifier = Modifier.width(16.dp))

                                Column {
                                    Text(
                                        text = "Payment Confirmation",
                                        fontSize = 14.sp,
                                        color = Color.Gray
                                    )

                                    Text(
                                        text = paymentStatus,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (paymentStatus == "CONFIRMED") Color(0xFF4CAF50) else Color(0xFFFF9800)
                                    )
                                }
                            }
                        }
                    }

                    // Client Info Card (unchanged)
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(60.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFE1F5FE)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Client",
                                    tint = Color(0xFF2962FF),
                                    modifier = Modifier.size(32.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(16.dp))

                            Column {
                                Text(
                                    text = "Client",
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )

                                Text(
                                    text = "${bookingDetail.user?.firstname ?: ""} ${bookingDetail.user?.lastname ?: ""}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Category,
                                        contentDescription = null,
                                        tint = Color(0xFF2962FF),
                                        modifier = Modifier.size(16.dp)
                                    )

                                    Spacer(modifier = Modifier.width(4.dp))

                                    Text(
                                        text = bookingDetail.category.name,
                                        fontSize = 14.sp,
                                        color = Color.Gray
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Updated Booking Details Card to include amount
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
                        ) {
                            Text(
                                text = "Booking Information",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )

                            BookingDetailRow(
                                label = "Booking ID",
                                value = "#${bookingDetail.id}",
                                icon = Icons.Default.Numbers
                            )

                            Divider(modifier = Modifier.padding(vertical = 8.dp))

                            // Fixed null safety for jobDetails
                            BookingDetailRow(
                                label = "Job Details",
                                value = bookingDetail.jobDetails ?: "No details",
                                icon = Icons.Default.Description
                            )

                            Divider(modifier = Modifier.padding(vertical = 8.dp))

                            BookingDetailRow(
                                label = "Payment Method",
                                value = bookingDetail.paymentMethod,
                                icon = Icons.Default.Payments
                            )

                            Divider(modifier = Modifier.padding(vertical = 8.dp))

                            BookingDetailRow(
                                label = "Category",
                                value = bookingDetail.category.name,
                                icon = Icons.Default.Category
                            )

                            Divider(modifier = Modifier.padding(vertical = 8.dp))

                            BookingDetailRow(
                                label = "Amount",
                                value = amount,
                                icon = Icons.Default.MonetizationOn
                            )

                            Divider(modifier = Modifier.padding(vertical = 8.dp))

                            BookingDetailRow(
                                label = "Created At",
                                value = createdAtFormatted,
                                icon = Icons.Default.CalendarToday
                            )

                            Divider(modifier = Modifier.padding(vertical = 8.dp))

                            BookingDetailRow(
                                label = "Updated At",
                                value = updatedAtFormatted,
                                icon = Icons.Default.Update
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Action Buttons
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                    ) {
                        if (canChat) {
                            Button(
                                onClick = {
                                    val currentUserId = TokenManager.getUserId() ?: 0L
                                    val isWorker = true
                                    val chatTitle = "${bookingDetail.user?.firstname} ${bookingDetail.user?.lastname}"
                                    navController.navigate("chat/$bookingId?currentUserId=$currentUserId&isWorker=$isWorker&chatTitle=$chatTitle")
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF2196F3)
                                )
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Chat,
                                    contentDescription = "Chat"
                                )

                                Spacer(modifier = Modifier.width(8.dp))

                                Text(
                                    text = "Chat with Client",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))
                        }

                        if (canAcceptOrReject) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        confirmTitle = "Reject Booking"
                                        confirmMessage = "Are you sure you want to reject this booking? This action cannot be undone."
                                        confirmButtonText = "Yes, Reject"
                                        confirmButtonColor = Color(0xFFD32F2F)
                                        confirmAction = {
                                            viewModel.rejectBooking(bookingDetail.id)
                                            navController.navigateUp()
                                        }
                                        showConfirmDialog = true
                                    },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(56.dp),
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        contentColor = Color(0xFFD32F2F)
                                    ),
                                    border = BorderStroke(1.dp, Color(0xFFD32F2F))
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = null
                                    )

                                    Spacer(modifier = Modifier.width(8.dp))

                                    Text(
                                        text = "Reject",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }

                                Button(
                                    onClick = {
                                        confirmTitle = "Accept Booking"
                                        confirmMessage = "Are you sure you want to accept this booking? You'll be responsible for completing this job."
                                        confirmButtonText = "Yes, Accept"
                                        confirmButtonColor = Color(0xFF2962FF)
                                        confirmAction = {
                                            viewModel.acceptBooking(bookingDetail.id)
                                            viewModel.getBookingById(bookingDetail.id)
                                        }
                                        showConfirmDialog = true
                                    },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(56.dp),
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFF2962FF)
                                    )
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null
                                    )

                                    Spacer(modifier = Modifier.width(8.dp))

                                    Text(
                                        text = "Accept",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        if (canComplete) {
                            Spacer(modifier = Modifier.height(12.dp))

                            Button(
                                onClick = {
                                    showCompletePaymentDialog = true
                                    amountInput = "" // Reset input
                                    amountError = null
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF388E3C)
                                )
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null
                                )

                                Spacer(modifier = Modifier.width(8.dp))

                                Text(
                                    text = "Mark Complete",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        if (canConfirmPayment) {
                            Spacer(modifier = Modifier.height(12.dp))

                            Button(
                                onClick = { showPaymentDialog = true },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF4CAF50)
                                )
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Payments,
                                    contentDescription = null
                                )

                                Spacer(modifier = Modifier.width(8.dp))

                                Text(
                                    text = "Confirm Payment",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        // Display error message if any
                        errorMessage?.let { message ->
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = message,
                                color = Color.Red,
                                fontSize = 14.sp,
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))
                    }
                }

                // Full-Screen Earned Animation Pop-Up
                if (showEarnedAnimation) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color(0xFF4CAF50)), // Green background for success
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier
                                    .size(100.dp)
                                    .alpha(animationAlpha)
                                    .scale(animationScale)
                            )
                            Spacer(modifier = Modifier.height(24.dp))
                            Text(
                                text = "+₱%.2f".format(earnedAmount),
                                fontSize = 48.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier
                                    .alpha(animationAlpha)
                                    .scale(animationScale)
                            )
                            Spacer(modifier = Modifier.height(24.dp))
                            Text(
                                text = "Payment Confirmed!",
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White,
                                modifier = Modifier.alpha(animationAlpha)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier
                                    .size(40.dp)
                                    .alpha(animationAlpha)
                            )
                        }
                    }
                }
            }
        }
    }

    // Payment Input Dialog for Complete Booking
    if (showCompletePaymentDialog) {
        AlertDialog(
            onDismissRequest = { showCompletePaymentDialog = false },
            title = { Text("Enter Job Amount") },
            text = {
                Column {
                    Text("Enter the amount for completing this job.")
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = amountInput,
                        onValueChange = {
                            amountInput = it
                            amountError = null
                        },
                        label = { Text("Amount (₱)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        isError = amountError != null,
                        modifier = Modifier.fillMaxWidth()
                    )
                    if (amountError != null) {
                        Text(
                            text = amountError!!,
                            color = Color.Red,
                            fontSize = 12.sp
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        val amount = amountInput.toDoubleOrNull()
                        if (amount == null || amount <= 0) {
                            amountError = "Please enter a valid amount greater than 0."
                        } else {
                            showCompletePaymentDialog = false
                            confirmTitle = "Complete Job"
                            confirmMessage = "Have you finished all the required work? The client will be asked to confirm completion."
                            confirmButtonText = "Yes, Mark Complete"
                            confirmButtonColor = Color(0xFF388E3C)
                            confirmAction = {
                                viewModel.completeBooking(
                                    bookingId = bookingId,
                                    amount = amount,
                                    onSuccess = { viewModel.getBookingById(bookingId) },
                                    onError = { errorMsg ->
                                        Log.e("WorkerBookingDetailsScreen", "Failed to complete job: $errorMsg")
                                        errorMessage = errorMsg
                                    }
                                )
                            }
                            showConfirmDialog = true
                        }
                    }
                ) {
                    Text("Next", color = Color(0xFF2962FF))
                }
            },
            dismissButton = {
                TextButton(onClick = { showCompletePaymentDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Payment Input Dialog for Confirm Payment
    if (showPaymentDialog) {
        AlertDialog(
            onDismissRequest = { showPaymentDialog = false },
            title = { Text("Enter Payment Amount") },
            text = {
                Column {
                    Text("Enter the amount paid by the client for this job.")
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = amountInput,
                        onValueChange = {
                            amountInput = it
                            amountError = null
                        },
                        label = { Text("Amount (₱)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        isError = amountError != null,
                        modifier = Modifier.fillMaxWidth()
                    )
                    if (amountError != null) {
                        Text(
                            text = amountError!!,
                            color = Color.Red,
                            fontSize = 12.sp
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        val amount = amountInput.toDoubleOrNull()
                        if (amount == null || amount <= 0) {
                            amountError = "Please enter a valid amount greater than 0."
                        } else {
                            showPaymentDialog = false
                            showPaymentConfirmDialog = true
                            earnedAmount = amount
                        }
                    }
                ) {
                    Text("Next", color = Color(0xFF2962FF))
                }
            },
            dismissButton = {
                TextButton(onClick = { showPaymentDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Payment Confirmation Dialog
    if (showPaymentConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showPaymentConfirmDialog = false },
            title = { Text("Confirm Payment") },
            text = { Text("Has the client paid ₱${"%.2f".format(earnedAmount)} for this job?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showPaymentConfirmDialog = false
                        viewModel.confirmPayment(
                            bookingId = bookingId,
                            amount = earnedAmount,
                            onSuccess = {
                                showEarnedAnimation = true
                                coroutineScope.launch {
                                    viewModel.getBookingById(bookingId)
                                    delay(5000) // Wait for 5 seconds
                                    showEarnedAnimation = false
                                    navController.navigate("worker_home") {
                                        popUpTo(navController.graph.startDestinationId) {
                                            inclusive = true
                                        }
                                    }
                                }
                            },
                            onError = { errorMsg ->
                                Log.e("WorkerBookingDetailsScreen", "Failed to confirm payment: $errorMsg")
                                errorMessage = errorMsg
                            }
                        )
                    }
                ) {
                    Text("Accept Payment", color = Color(0xFF4CAF50))
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showPaymentConfirmDialog = false
                        showPaymentDialog = true
                    }
                ) {
                    Text("Back")
                }
            }
        )
    }

    // Confirmation Dialog
    if (showConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showConfirmDialog = false },
            title = { Text(confirmTitle) },
            text = { Text(confirmMessage) },
            confirmButton = {
                TextButton(
                    onClick = {
                        confirmAction()
                        showConfirmDialog = false
                    }
                ) {
                    Text(
                        text = confirmButtonText,
                        color = confirmButtonColor
                    )
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showConfirmDialog = false }
                ) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun BookingDetailRow(
    label: String,
    value: String,
    icon: ImageVector
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color(0xFF2962FF),
            modifier = Modifier.size(20.dp)
        )

        Spacer(modifier = Modifier.width(12.dp))

        Column {
            Text(
                text = label,
                fontSize = 14.sp,
                color = Color.Gray
            )

            Text(
                text = value,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun WorkerBookingDetailsScreenPreview() {
    TarabahoTheme {
        WorkerBookingDetailsScreen(
            navController = rememberNavController(),
            bookingId = 123L
        )
    }
}