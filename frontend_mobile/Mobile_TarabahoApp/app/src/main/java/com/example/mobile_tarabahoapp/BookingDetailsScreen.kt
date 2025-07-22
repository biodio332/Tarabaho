import android.util.Log
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.mobile_tarabahoapp.AuthRepository.BookingViewModel
import com.example.mobile_tarabahoapp.ui.theme.TarabahoTheme
import com.example.mobile_tarabahoapp.utils.TokenManager
import kotlinx.coroutines.delay
import com.example.mobile_tarabahoapp.ui.MainNavigationBar
import com.example.mobile_tarabahoapp.ui.NavScreen

// Updated BookingDetail to include amount and paymentConfirmationStatus
data class BookingDetail(
    val id: String,
    val category: String,
    val status: String,
    val paymentMethod: String,
    val jobDetails: String,
    val createdAt: String,
    val updatedAt: String,
    val type: String,
    val worker: String,
    val amount: String, // New field
    val paymentConfirmationStatus: String // New field
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingDetailsScreen(navController: NavController, bookingId: String) {
    val viewModel: BookingViewModel = viewModel()
    val booking by viewModel.selectedBooking.observeAsState()

    // Fetch booking from backend initially
    LaunchedEffect(bookingId) {
        viewModel.getBookingById(bookingId.toLong())
    }

    // Updated polling to redirect to rate_worker when COMPLETED and CONFIRMED
    LaunchedEffect(bookingId) {
        while (true) {
            viewModel.getBookingById(bookingId.toLong())
            if (booking?.status == "COMPLETED" && booking?.paymentConfirmationStatus == "CONFIRMED") {
                navController.navigate("rate_worker/$bookingId")
                break
            }
            if (booking?.status in listOf("REJECTED", "CANCELLED")) {
                break
            }
            delay(5000) // Check every 5 seconds
        }
    }

    // Updated booking data with new fields
    val bookingDetail = remember(booking) {
        BookingDetail(
            id = booking?.id?.toString() ?: "",
            category = booking?.category?.name ?: "Unknown",
            status = booking?.status ?: "PENDING",
            paymentMethod = booking?.paymentMethod ?: "Unknown",
            jobDetails = booking?.jobDetails ?: "No job details",
            createdAt = booking?.createdAt ?: "",
            updatedAt = booking?.updatedAt ?: "",
            type = booking?.type ?: "",
            worker = "${booking?.worker?.firstName ?: "Unknown"} ${booking?.worker?.lastName ?: ""}",
            amount = booking?.amount?.let { "₱%.2f".format(it) } ?: "Not set",
            paymentConfirmationStatus = booking?.paymentConfirmationStatus ?: "Not set"
        )
    }

    // State for job completion dialog
    var showCompletionDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Booking Details",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.navigate("home") }) {
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
        },
        bottomBar = {
            MainNavigationBar(
                selectedScreen = NavScreen.Home,
                onScreenSelected = { screen ->
                    when (screen) {
                        is NavScreen.Profile -> navController.navigate("settings")
                        is NavScreen.Home -> navController.navigateUp()
                        is NavScreen.Tasks -> navController.navigate("user_bookings")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF5F5F5))
                .verticalScroll(rememberScrollState())
        ) {
            // Updated Status Card to show paymentConfirmationStatus
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = when (bookingDetail.status) {
                        "ACCEPTED" -> Color(0xFFE8F5E9)
                        "IN_PROGRESS" -> Color(0xFFE3F2FD)
                        "COMPLETED" -> Color(0xFFE0F7FA)
                        else -> Color(0xFFFFF3E0)
                    }
                ),
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
                            imageVector = when (bookingDetail.status) {
                                "ACCEPTED" -> Icons.Default.CheckCircle
                                "IN_PROGRESS" -> Icons.Default.Pending
                                "COMPLETED" -> Icons.Default.Done
                                else -> Icons.Default.Schedule
                            },
                            contentDescription = null,
                            tint = when (bookingDetail.status) {
                                "ACCEPTED" -> Color(0xFF4CAF50)
                                "IN_PROGRESS" -> Color(0xFF2196F3)
                                "COMPLETED" -> Color(0xFF00BCD4)
                                else -> Color(0xFFFF9800)
                            },
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
                                text = bookingDetail.status,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = when (bookingDetail.status) {
                                    "ACCEPTED" -> Color(0xFF4CAF50)
                                    "IN_PROGRESS" -> Color(0xFF2196F3)
                                    "COMPLETED" -> Color(0xFF00BCD4)
                                    else -> Color(0xFFFF9800)
                                }
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
                            tint = if (bookingDetail.paymentConfirmationStatus == "CONFIRMED") Color(0xFF4CAF50) else Color(0xFFFF9800),
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
                                text = bookingDetail.paymentConfirmationStatus,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (bookingDetail.paymentConfirmationStatus == "CONFIRMED") Color(0xFF4CAF50) else Color(0xFFFF9800)
                            )
                        }
                    }
                }
            }

            // Worker Info Card (unchanged)
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
                            .background(Color(0xFFE1F5FE))
                            .border(2.dp, Color(0xFF2962FF), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Worker",
                            tint = Color(0xFF2962FF),
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column {
                        Text(
                            text = "Worker",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )

                        Text(
                            text = bookingDetail.worker,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = Color(0xFFFFC107),
                                modifier = Modifier.size(16.dp)
                            )

                            Spacer(modifier = Modifier.width(4.dp))

                            Text(
                                text = "4.8",
                                fontSize = 14.sp,
                                color = Color.Gray
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Updated Booking Details Card with amount removed
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

                    DetailRow(
                        label = "Booking ID",
                        value = bookingDetail.id,
                        icon = Icons.Default.Numbers
                    )

                    Divider(modifier = Modifier.padding(vertical = 8.dp))

                    DetailRow(
                        label = "Category",
                        value = bookingDetail.category,
                        icon = Icons.Default.Category
                    )

                    Divider(modifier = Modifier.padding(vertical = 8.dp))

                    DetailRow(
                        label = "Payment Method",
                        value = bookingDetail.paymentMethod,
                        icon = Icons.Default.Payments
                    )

                    Divider(modifier = Modifier.padding(vertical = 8.dp))

                    DetailRow(
                        label = "Amount",
                        value = bookingDetail.amount,
                        icon = Icons.Default.Payments
                    )

                    Divider(modifier = Modifier.padding(vertical = 8.dp))

                    DetailRow(
                        label = "Job Details",
                        value = bookingDetail.jobDetails,
                        icon = Icons.Default.Description
                    )

                    Divider(modifier = Modifier.padding(vertical = 8.dp))

                    DetailRow(
                        label = "Created At",
                        value = bookingDetail.createdAt,
                        icon = Icons.Default.CalendarToday
                    )

                    Divider(modifier = Modifier.padding(vertical = 8.dp))

                    DetailRow(
                        label = "Updated At",
                        value = bookingDetail.updatedAt,
                        icon = Icons.Default.Update
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons (unchanged except dialog behavior)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                if (bookingDetail.status in listOf("ACCEPTED", "IN_PROGRESS", "WORKER_COMPLETED", "COMPLETED")) {
                    Button(
                        onClick = {
                            val currentUserId = TokenManager.getUserId() ?: 0L
                            val isWorker = false
                            val chatTitle = bookingDetail.worker
                            navController.navigate("chat/$bookingId?currentUserId=$currentUserId&isWorker=$isWorker&chatTitle=$chatTitle")
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2196F3),
                            contentColor = Color.White
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Chat,
                            contentDescription = "Chat"
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        Text(
                            text = "Chat with Worker",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                }

                Button(
                    onClick = {
                        viewModel.startBooking(
                            bookingId.toLong(),
                            onSuccess = {
                                viewModel.getBookingById(bookingId.toLong())
                            },
                            onError = { errorMessage ->
                                Log.e("BookingDetailsScreen", "Failed to start job: $errorMessage")
                            }
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (bookingDetail.status == "IN_PROGRESS" || bookingDetail.status == "WORKER_COMPLETED" || bookingDetail.status == "COMPLETED") Color.Gray else Color(0xFF2962FF),
                        contentColor = Color.White
                    ),
                    enabled = bookingDetail.status == "ACCEPTED"
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = if (bookingDetail.status == "IN_PROGRESS" || bookingDetail.status == "WORKER_COMPLETED" || bookingDetail.status == "COMPLETED") "Job Started" else "Start Job",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = { showCompletionDialog = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (bookingDetail.status == "WORKER_COMPLETED") Color(0xFF4CAF50) else Color.Gray,
                        contentColor = Color.White
                    ),
                    enabled = bookingDetail.status == "WORKER_COMPLETED"
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = "Accept Completion",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (bookingDetail.status == "WORKER_COMPLETED") {
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {
                            viewModel.markBookingInProgress(
                                bookingId = bookingDetail.id.toLong(),
                                onSuccess = {
                                    viewModel.getBookingById(bookingDetail.id.toLong())
                                },
                                onError = { errorMessage ->
                                    Log.e("BookingDetailsScreen", "Failed to revert to in progress: $errorMessage")
                                }
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFE53935),
                            contentColor = Color.White
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Undo,
                            contentDescription = null
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        Text(
                            text = "Not Satisfied",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    // Updated dialog to not navigate immediately
    if (showCompletionDialog) {
        AlertDialog(
            onDismissRequest = { showCompletionDialog = false },
            title = { Text("Confirm Job Completion") },
            text = {
                Text(
                    "Are you satisfied with the work done by ${bookingDetail.worker}? " +
                            "Confirming completion will notify the worker to confirm payment."
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showCompletionDialog = false
                        viewModel.acceptCompletion(
                            bookingId = bookingDetail.id.toLong(),
                            onSuccess = {
                                viewModel.getBookingById(bookingDetail.id.toLong())
                            },
                            onError = { errorMessage ->
                                Log.e("BookingDetailsScreen", "Failed to accept completion: $errorMessage")
                            }
                        )
                    }
                ) {
                    Text(
                        text = "Yes, Complete Job",
                        color = Color(0xFF4CAF50)
                    )
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showCompletionDialog = false }
                ) {
                    Text("Not Yet")
                }
            }
        )
    }
}

@Composable
fun DetailRow(
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
fun BookingDetailsScreenPreview() {
    TarabahoTheme {
        BookingDetailsScreen(
            navController = rememberNavController(),
            bookingId = "BK123"
        )
    }
}