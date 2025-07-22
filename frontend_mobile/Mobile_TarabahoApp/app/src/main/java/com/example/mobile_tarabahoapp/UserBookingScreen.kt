package com.example.mobile_tarabahoapp

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.mobile_tarabahoapp.AuthRepository.BookingViewModel

@Composable
fun UserBookingScreen(
    navController: NavController,
    viewModel: BookingViewModel = viewModel()
) {
    val bookings by viewModel.userBookings.observeAsState(initial = emptyList())
    val error by viewModel.userBookingError.observeAsState()

    var activeTab by remember { mutableStateOf("active") }

    // Match your backend's enum values exactly
    val activeStatuses = listOf("PENDING", "ACCEPTED", "IN_PROGRESS", "WORKER_COMPLETED")
    val pastStatuses = listOf("REJECTED", "CANCELLED", "COMPLETED")

    val activeBookings = bookings.filter { it.status.uppercase() in activeStatuses }
    val pastBookings = bookings.filter { it.status.uppercase() in pastStatuses }

    LaunchedEffect(Unit) {
        viewModel.fetchUserBookings()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        // Header with gradient background and back button
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(
                            Color(0xFF1E88E5),
                            Color(0xFF2962FF)
                        ),
                        start = Offset(0f, 0f),
                        end = Offset(Float.POSITIVE_INFINITY, 300f)
                    )
                )
        ) {
            // Back button
            IconButton(
                onClick = {
                    navController.navigate("home") {
                        popUpTo("user_bookings") { inclusive = true }
                        launchSingleTop = true
                    }
                },
                modifier = Modifier
                    .padding(16.dp)
                    .size(40.dp)
                    .align(Alignment.TopStart)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.2f))
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }

            // Title
            Text(
                "My Bookings",
                fontWeight = FontWeight.Bold,
                fontSize = 28.sp,
                color = Color.White,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(start = 16.dp, bottom = 16.dp)
            )
        }

        // Tabs with better styling
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { activeTab = "active" },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (activeTab == "active") Color(0xFF2962FF) else Color.White,
                    contentColor = if (activeTab == "active") Color.White else Color(0xFF2962FF)
                ),
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = if (activeTab == "active") 4.dp else 0.dp
                )
            ) {
                Text(
                    "Active (${activeBookings.size})",
                    fontWeight = FontWeight.Medium,
                    fontSize = 16.sp
                )
            }

            Button(
                onClick = { activeTab = "past" },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (activeTab == "past") Color(0xFF2962FF) else Color.White,
                    contentColor = if (activeTab == "past") Color.White else Color(0xFF2962FF)
                ),
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = if (activeTab == "past") 4.dp else 0.dp
                )
            ) {
                Text(
                    "Past (${pastBookings.size})",
                    fontWeight = FontWeight.Medium,
                    fontSize = 16.sp
                )
            }
        }

        // Error message with better styling
        if (!error.isNullOrEmpty()) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    "Error: $error",
                    color = Color(0xFFD32F2F),
                    modifier = Modifier.padding(12.dp),
                    fontWeight = FontWeight.Medium
                )
            }
        }

        val shownBookings = if (activeTab == "active") activeBookings else pastBookings

        // Empty state with better styling
        if (shownBookings.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (activeTab == "active")
                        "No active bookings found"
                    else
                        "No past bookings found",
                    color = Color.Gray,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            // Bookings list with better styling
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                contentPadding = PaddingValues(bottom = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(shownBookings) { booking ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                if (booking.status.uppercase() == "PENDING") {
                                    navController.navigate("booking_status/${booking.id}")
                                } else {
                                    navController.navigate("booking_details/${booking.id}")
                                }
                            },
                        shape = RoundedCornerShape(16.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            // Category with icon
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFFE3F2FD)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Category,
                                        contentDescription = null,
                                        tint = Color(0xFF2962FF),
                                        modifier = Modifier.size(24.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.width(12.dp))

                                Text(
                                    "Category: ${booking.category.name}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = Color(0xFF2962FF)
                                )

                                Spacer(modifier = Modifier.weight(1f))

                                // Status chip
                                val (statusColor, statusBgColor) = when (booking.status.uppercase()) {
                                    "PENDING" -> Pair(Color(0xFFF57F17), Color(0xFFFFF9C4))
                                    "ACCEPTED" -> Pair(Color(0xFF0288D1), Color(0xFFE1F5FE))
                                    "IN_PROGRESS" -> Pair(Color(0xFF2E7D32), Color(0xFFE8F5E9))
                                    "WORKER_COMPLETED" -> Pair(Color(0xFF00796B), Color(0xFFE0F2F1))
                                    "COMPLETED" -> Pair(Color(0xFF2E7D32), Color(0xFFE8F5E9))
                                    "REJECTED" -> Pair(Color(0xFFD32F2F), Color(0xFFFFEBEE))
                                    "CANCELLED" -> Pair(Color(0xFF7B1FA2), Color(0xFFF3E5F5))
                                    else -> Pair(Color(0xFF616161), Color(0xFFEEEEEE))
                                }

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(statusBgColor)
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = booking.status,
                                        color = statusColor,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }

                            Divider(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 12.dp),
                                color = Color(0xFFE0E0E0)
                            )

                            // Job details with icon
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    "Job: ",
                                    fontWeight = FontWeight.Medium,
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )

                                Text(
                                    booking.jobDetails ?: "No Booking Details",
                                    fontSize = 14.sp,
                                    color = Color.Black
                                )
                            }

                            // Date with icon
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CalendarToday,
                                    contentDescription = null,
                                    tint = Color(0xFF2962FF),
                                    modifier = Modifier.size(16.dp)
                                )

                                Spacer(modifier = Modifier.width(8.dp))

                                Text(
                                    "Date: ${booking.createdAt}",
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                            }

                            // Worker info with icon (if available)
                            booking.worker?.let {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Person,
                                        contentDescription = null,
                                        tint = Color(0xFF2962FF),
                                        modifier = Modifier.size(16.dp)
                                    )

                                    Spacer(modifier = Modifier.width(8.dp))

                                    Text(
                                        "Worker: ${it.firstName} ${it.lastName}",
                                        fontSize = 14.sp,
                                        color = Color.Black
                                    )
                                }
                            }

                            // Payment method with icon
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Payments,
                                    contentDescription = null,
                                    tint = Color(0xFF2962FF),
                                    modifier = Modifier.size(16.dp)
                                )

                                Spacer(modifier = Modifier.width(8.dp))

                                Text(
                                    "Payment: ${booking.paymentMethod}",
                                    fontSize = 14.sp,
                                    color = Color.Black
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun UserBookingScreenPreview() {
    UserBookingScreen(navController = rememberNavController())
}