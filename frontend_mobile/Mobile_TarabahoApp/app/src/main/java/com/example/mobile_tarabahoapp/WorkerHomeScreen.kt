package com.example.mobile_tarabahoapp

import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.mobile_tarabahoapp.AuthRepository.WorkerViewModel
import com.example.mobile_tarabahoapp.AuthRepository.BookingViewModel
import com.example.mobile_tarabahoapp.model.Booking
import com.example.mobile_tarabahoapp.model.Worker
import com.example.mobile_tarabahoapp.ui.theme.TarabahoTheme
import com.example.mobile_tarabahoapp.utils.TokenManager
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.delay

enum class JobStatus {
    PENDING_ACCEPTANCE,
    UPCOMING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}

data class Job(
    val id: String,
    val title: String,
    val clientName: String,
    val clientImage: Int,
    val location: String,
    val dateTime: Date,
    val payment: Double,
    val status: JobStatus,
    val description: String
)

fun Booking.toJob(): Job {
    val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
    return Job(
        id = this.id.toString(),
        title = this.category?.name ?: "Unknown",
        clientName = "${this.user?.firstname ?: "Unknown"} ${this.user?.lastname ?: ""}",
        clientImage = R.drawable.client_david, // Default client image
        location = this.user?.location ?: "No location",
        dateTime = try {
            formatter.parse(this.createdAt)
        } catch (e: Exception) {
            Date()
        },
        payment = this.amount ?: 0.0, // Updated to use booking.amount if available
        status = when (this.status) {
            "PENDING" -> JobStatus.PENDING_ACCEPTANCE
            "ACCEPTED" -> JobStatus.UPCOMING
            "IN_PROGRESS" -> JobStatus.IN_PROGRESS
            "WORKER_COMPLETED" -> JobStatus.IN_PROGRESS
            "COMPLETED" -> JobStatus.COMPLETED
            "REJECTED", "CANCELLED" -> JobStatus.CANCELLED
            else -> JobStatus.PENDING_ACCEPTANCE
        },
        description = this.jobDetails ?: ""
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkerHomeScreen(
    navController: NavController,
    bookingViewModel: BookingViewModel = viewModel(),
    workerViewModel: WorkerViewModel = viewModel()
) {
    val dateFormat = SimpleDateFormat("EEE, MMM dd • h:mm a", Locale.getDefault())

    val activeBookings by bookingViewModel.activeBookings.observeAsState(emptyList())
    val pastBookings by bookingViewModel.pastBookings.observeAsState(emptyList())
    val error by bookingViewModel.error.observeAsState()
    val worker by workerViewModel.selectedWorker.observeAsState()

    LaunchedEffect(Unit) {
        bookingViewModel.fetchWorkerBookings()
        val workerId = TokenManager.getWorkerId().toString()
        workerViewModel.fetchWorkerById(workerId)
    }

    LaunchedEffect(Unit) {
        while (true) {
            bookingViewModel.fetchWorkerBookings()
            delay(3000)
        }
    }
    val workerName = worker?.firstName ?: "Worker"
    val activeJobs = activeBookings.map { it.toJob() }
    val pastJobs = pastBookings.map { it.toJob() }

    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Worker Dashboard", color = Color.White) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF2962FF)),
                actions = {
                    IconButton(onClick = { /* Notifications */ }) {
                        Icon(Icons.Default.Notifications, contentDescription = "Notifications", tint = Color.White)
                    }
                    IconButton(onClick = { navController.navigate("worker_edit_profile") }) {
                        Icon(Icons.Default.Person, contentDescription = "Profile", tint = Color.White)
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
        ) {
            // Worker welcome section
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF2962FF)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Worker avatar
                    Image(
                        painter = painterResource(id = R.drawable.worker_avatar),
                        contentDescription = "Worker Avatar",
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .border(2.dp, Color.White, CircleShape),
                        contentScale = ContentScale.Crop
                    )

                    Spacer(modifier = Modifier.width(16.dp))

                    Column {
                        Text(
                            text = "Welcome back, $workerName!!",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Text(
                            text = "You have ${activeJobs.count { it.status == JobStatus.PENDING_ACCEPTANCE }} new job requests",
                            color = Color.White,
                            fontSize = 14.sp
                        )
                    }
                }
            }

            // Job statistics
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                StatCard(
                    icon = Icons.Default.CheckCircle,
                    value = "${pastJobs.count { it.status == JobStatus.COMPLETED }}",
                    label = "Completed",
                    color = Color(0xFF4CAF50),
                    modifier = Modifier.weight(1f)
                )

                Spacer(modifier = Modifier.width(8.dp))

                StatCard(
                    icon = Icons.Default.Star,
                    value = worker?.stars?.let { String.format("%.1f", it) } ?: "N/A",
                    label = "Rating",
                    color = Color(0xFFFFC107),
                    modifier = Modifier.weight(1f)
                )

                Spacer(modifier = Modifier.width(8.dp))

                StatCard(
                    icon = Icons.Default.MonetizationOn,
                    value = "₱5,240", // This could be updated to reflect actual earnings
                    label = "Earned",
                    color = Color(0xFF2962FF),
                    modifier = Modifier.weight(1f)
                )
            }

            // Tab Row for Active and Past Bookings
            TabRow(
                selectedTabIndex = selectedTab,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                containerColor = Color.White,
                contentColor = Color(0xFF2962FF),
                indicator = { tabPositions ->
                    TabRowDefaults.Indicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        height = 3.dp,
                        color = Color(0xFF2962FF)
                    )
                }
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = {
                        Text(
                            text = "Active (${activeJobs.size})",
                            fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = {
                        Text(
                            text = "Past Bookings (${pastJobs.size})",
                            fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
            }

            // Content based on selected tab
            when (selectedTab) {
                0 -> {
                    // ACTIVE BOOKINGS TAB
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp)
                    ) {
                        items(activeBookings) { booking ->
                            JobCard(
                                job = booking.toJob(),
                                dateFormat = dateFormat,
                                onAccept = if (booking.status == "PENDING") {
                                    { bookingViewModel.acceptBooking(booking.id) }
                                } else null,
                                onDecline = if (booking.status == "PENDING") {
                                    { bookingViewModel.rejectBooking(booking.id) }
                                } else null,
                                onComplete = if (booking.status == "IN_PROGRESS") {
                                    {
                                        bookingViewModel.completeBooking(
                                            bookingId = booking.id,
                                            amount = 0.0, // Default amount; will be updated in WorkerBookingDetailsScreen
                                            onSuccess = {
                                                // Refresh bookings after completion
                                                bookingViewModel.fetchWorkerBookings()
                                            },
                                            onError = { errorMessage ->
                                                // Handle error (e.g., show a toast or log)
                                                println("Error completing booking: $errorMessage")
                                            }
                                        )
                                    }
                                } else null,
                                onViewDetails = {
                                    navController.navigate("worker_booking_details/${booking.id}")
                                }
                            )
                        }
                    }
                }

                1 -> {
                    // PAST BOOKINGS TAB
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp)
                    ) {
                        items(pastBookings) { booking ->
                            JobCard(
                                job = booking.toJob(),
                                dateFormat = dateFormat,
                                onViewDetails = {
                                    navController.navigate("worker_booking_details/${booking.id}")
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SectionHeader(title: String, count: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = title,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = "$count jobs",
            fontSize = 14.sp,
            color = Color.Gray
        )
    }
}

@Composable
fun StatCard(
    icon: ImageVector,
    value: String,
    label: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .padding(vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(24.dp)
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = value,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = label,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
fun JobCard(
    job: Job,
    dateFormat: SimpleDateFormat,
    onAccept: (() -> Unit)? = null,
    onDecline: (() -> Unit)? = null,
    onComplete: (() -> Unit)? = null,
    onViewDetails: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable(onClick = onViewDetails),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Job status chip
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Job title
                Text(
                    text = job.title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                // Status chip
                val (statusColor, statusText) = when (job.status) {
                    JobStatus.PENDING_ACCEPTANCE -> Color(0xFFFFA000) to "New Request"
                    JobStatus.UPCOMING -> Color(0xFF2962FF) to "Upcoming"
                    JobStatus.IN_PROGRESS -> Color(0xFF7B1FA2) to "In Progress"
                    JobStatus.COMPLETED -> Color(0xFF388E3C) to "Completed"
                    JobStatus.CANCELLED -> Color(0xFFD32F2F) to "Cancelled"
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(statusColor.copy(alpha = 0.1f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = statusText,
                        color = statusColor,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Client info
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    painter = painterResource(id = job.clientImage),
                    contentDescription = "Client Image",
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = job.clientName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = Color.Gray,
                            modifier = Modifier.size(14.dp)
                        )

                        Spacer(modifier = Modifier.width(4.dp))

                        Text(
                            text = job.location,
                            fontSize = 14.sp,
                            color = Color.Gray,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Job details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Date and time
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        tint = Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )

                    Spacer(modifier = Modifier.width(4.dp))

                    Text(
                        text = dateFormat.format(job.dateTime),
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }

                // Payment
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Payments,
                        contentDescription = null,
                        tint = Color(0xFF2962FF),
                        modifier = Modifier.size(16.dp)
                    )

                    Spacer(modifier = Modifier.width(4.dp))

                    Text(
                        text = "₱${job.payment.toInt()}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2962FF)
                    )
                }
            }

            // Job description
            if (job.description.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = job.description,
                    fontSize = 14.sp,
                    color = Color.DarkGray,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // Action buttons
            if (onAccept != null || onDecline != null || onComplete != null) {
                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    // Decline button (for pending jobs)
                    if (onDecline != null) {
                        OutlinedButton(
                            onClick = onDecline,
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color.Gray
                            ),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = SolidColor(Color.LightGray)
                            )
                        ) {
                            Text("Decline")
                        }

                        Spacer(modifier = Modifier.width(8.dp))
                    }

                    // Accept button (for pending jobs)
                    if (onAccept != null) {
                        Button(
                            onClick = onAccept,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF2962FF)
                            )
                        ) {
                            Text("Accept")
                        }
                    }

                    // Complete button (for in-progress jobs)
                    if (onComplete != null) {
                        Button(
                            onClick = onComplete,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF388E3C)
                            )
                        ) {
                            Text("Mark Complete")
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun WorkerHomeScreenPreview() {
    TarabahoTheme {
        WorkerHomeScreen(rememberNavController())
    }
}