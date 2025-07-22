package com.example.mobile_tarabahoapp
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.mobile_tarabahoapp.AuthRepository.BookingViewModel
import com.example.mobile_tarabahoapp.ui.theme.TarabahoTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import com.example.mobile_tarabahoapp.ui.MainNavigationBar
import com.example.mobile_tarabahoapp.ui.NavScreen

enum class BookingStatusState {
    PENDING,
    ACCEPTED,
    REJECTED,
    CANCELLED
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingStatusScreen(
    navController: NavController,
    bookingId: String = "BK12345",
    initialStatus: BookingStatusState = BookingStatusState.PENDING // Added parameter for testing different states
) {
    val context = LocalContext.current

    //  Add ViewModel here
    val viewModel: BookingViewModel = viewModel()

    val booking = viewModel.selectedBooking.observeAsState().value
    // State for booking status
    var bookingStatus by remember { mutableStateOf(initialStatus) }

    // State for confirmation dialog
    var showCancelDialog by remember { mutableStateOf(false) }

    // State for rejection reason (if applicable)
    val rejectionReason = remember { mutableStateOf("Worker is unavailable at the requested time") }

    // Animation for the loading indicator
    val infiniteTransition = rememberInfiniteTransition(label = "loading_animation")
    val animatedProgress = infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "progress_animation"
    )

    // Coroutine scope for simulating status updates
    val coroutineScope = rememberCoroutineScope()

    // Function to handle booking cancellation
    fun cancelBooking(context: Context) {
        coroutineScope.launch {
            viewModel.cancelBooking(bookingId.toLong()) { success, message ->
                if (success) {
                    bookingStatus = BookingStatusState.CANCELLED
                    Toast.makeText(context, message, Toast.LENGTH_SHORT).show()

                    // Delay must be inside another coroutine or removed
                    coroutineScope.launch {
                        delay(1500)
                        navController.popBackStack()
                    }
                } else {
                    // Removed error Toast
                }
            }
        }
    }

    LaunchedEffect(bookingId) {
        viewModel.getBookingById(bookingId.toLong())

        while (true) {

            viewModel.checkBookingStatus(bookingId.toLong()) { status ->
                bookingStatus = when (status) {
                    "PENDING" -> BookingStatusState.PENDING
                    "ACCEPTED" -> BookingStatusState.ACCEPTED
                    "REJECTED" -> BookingStatusState.REJECTED
                    "CANCELLED" -> BookingStatusState.CANCELLED
                    else -> BookingStatusState.PENDING
                }

                if (bookingStatus == BookingStatusState.ACCEPTED) {
                    navController.navigate("booking_details/$bookingId") {
                        popUpTo("booking_status/$bookingId") { inclusive = true }
                    }
                }
            }
            // ✅ ADDED: re-fetch booking if still null
            if (viewModel.selectedBooking.value == null) {
                viewModel.getBookingById(bookingId.toLong())
            }

            delay(5000)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Booking Status",
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
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // Booking ID Card
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
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Booking ID",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )

                    Text(
                        text = bookingId,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2962FF)
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Status Indicator
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .clip(CircleShape)
                    .background(
                        when (bookingStatus) {
                            BookingStatusState.PENDING -> Color(0xFFE3F2FD)
                            BookingStatusState.ACCEPTED -> Color(0xFFE8F5E9)
                            BookingStatusState.REJECTED -> Color(0xFFFFEBEE)
                            BookingStatusState.CANCELLED -> Color(0xFFF5F5F5)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                when (bookingStatus) {
                    BookingStatusState.PENDING -> {
                        // Loading spinner
                        CircularProgressIndicator(
                            modifier = Modifier.size(80.dp),
                            color = Color(0xFF2962FF),
                            trackColor = Color(0xFFBBDEFB),
                            progress = animatedProgress.value
                        )

                        // Clock icon in center
                        Icon(
                            imageVector = Icons.Default.Schedule,
                            contentDescription = "Waiting",
                            tint = Color(0xFF2962FF),
                            modifier = Modifier.size(40.dp)
                        )
                    }
                    BookingStatusState.ACCEPTED -> {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Accepted",
                            tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(80.dp)
                        )
                    }
                    BookingStatusState.REJECTED -> {
                        Icon(
                            imageVector = Icons.Default.Cancel,
                            contentDescription = "Rejected",
                            tint = Color(0xFFF44336),
                            modifier = Modifier.size(80.dp)
                        )
                    }
                    BookingStatusState.CANCELLED -> {
                        Icon(
                            imageVector = Icons.Default.DoNotDisturb,
                            contentDescription = "Cancelled",
                            tint = Color(0xFF9E9E9E),
                            modifier = Modifier.size(80.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Status Text
            Text(
                text = when (bookingStatus) {
                    BookingStatusState.PENDING -> "Waiting for worker to accept the booking"
                    BookingStatusState.ACCEPTED -> "Booking accepted! Worker is on the way."
                    BookingStatusState.REJECTED -> "Booking rejected by worker."
                    BookingStatusState.CANCELLED -> "Booking cancelled."
                },
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 32.dp),
                color = when (bookingStatus) {
                    BookingStatusState.REJECTED -> Color(0xFFF44336)
                    else -> MaterialTheme.colorScheme.onSurface
                }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Additional info text based on status
            when (bookingStatus) {
                BookingStatusState.PENDING -> {
                    Text(
                        text = "This may take a few minutes. You'll be notified once a worker accepts your booking.",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 32.dp)
                    )
                }
                BookingStatusState.REJECTED -> {
                    // Rejection reason card
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = "Rejection Reason",
                                tint = Color(0xFFF44336),
                                modifier = Modifier.size(24.dp)
                            )

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(
                                    text = "Reason for rejection:",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFF44336)
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = rejectionReason.value,
                                    fontSize = 14.sp,
                                    color = Color.DarkGray
                                )
                            }
                        }
                    }
                }
                else -> { /* No additional info for other states */ }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {

                    // Service Type
                    BookingDetailRow("Service Type", booking?.category?.name ?: "Loading...")

                    Divider(modifier = Modifier.padding(vertical = 12.dp))

                    // Job Details
                    BookingDetailRow("Job Details", booking?.jobDetails ?: "Loading...")

                    Divider(modifier = Modifier.padding(vertical = 12.dp))

                    // Payment Method
                    BookingDetailRow("Payment Method", booking?.paymentMethod ?: "Loading...")

                    Divider(modifier = Modifier.padding(vertical = 12.dp))
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Spacer(modifier = Modifier.height(32.dp))

            // Action buttons based on status
            when (bookingStatus) {
                BookingStatusState.PENDING -> {
                    // Cancel Button for pending bookings
                    OutlinedButton(
                        onClick = { showCancelDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color(0xFFE53935)
                        ),
                        border = BorderStroke(1.dp, Color(0xFFE53935))
                    ) {
                        Text(
                            text = "Cancel Booking",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                BookingStatusState.REJECTED -> {
                    // Action buttons for rejected bookings
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                    ) {
                        // Try again button
                        Button(
                            onClick = { navController.navigate("booking_details/$bookingId") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF2962FF)
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Try Again"
                            )

                            Spacer(modifier = Modifier.width(8.dp))

                            Text(
                                text = "Return",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Find another worker button
                    }
                }
                BookingStatusState.ACCEPTED -> {
                    // View details button for accepted bookings
                    Button(
                        onClick = { navController.navigate("booking_details/$bookingId") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50)
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Visibility,
                            contentDescription = "View Details"
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        Text(
                            text = "View Booking Details",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                BookingStatusState.CANCELLED -> {
                    // Return to home button for cancelled bookings
                    Button(
                        onClick = { navController.navigate("home") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .padding(horizontal = 16.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2962FF)
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Home,
                            contentDescription = "Home"
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        Text(
                            text = "Return to Home",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    // Cancel Confirmation Dialog
    if (showCancelDialog) {
        AlertDialog(
            onDismissRequest = { showCancelDialog = false },
            title = { Text("Cancel Booking") },
            text = { Text("Are you sure you want to cancel this booking? This action cannot be undone.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showCancelDialog = false
                        cancelBooking(context)
                    }
                ) {
                    Text(
                        text = "Yes, Cancel",
                        color = Color(0xFFE53935)
                    )
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showCancelDialog = false }
                ) {
                    Text("No, Keep Booking")
                }
            }
        )
    }
}

@Preview(showBackground = true)
@Composable
fun BookingStatusScreenPreview() {
    TarabahoTheme {
        BookingStatusScreen(rememberNavController())
    }
}

@Preview(showBackground = true)
@Composable
fun BookingStatusScreenRejectedPreview() {
    TarabahoTheme {
        BookingStatusScreen(
            navController = rememberNavController(),
            initialStatus = BookingStatusState.REJECTED
        )
    }
}

@Composable
fun BookingDetailRow(title: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = title,
                fontSize = 12.sp,
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
