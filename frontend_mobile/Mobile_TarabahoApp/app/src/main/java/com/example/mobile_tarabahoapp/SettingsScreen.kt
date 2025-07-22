package com.example.mobile_tarabahoapp

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.mobile_tarabahoapp.ui.theme.TarabahoTheme
import com.example.mobile_tarabahoapp.AuthRepository.LoginViewModel
import androidx.compose.ui.platform.LocalContext
import com.example.mobile_tarabahoapp.ui.MainNavigationBar
import com.example.mobile_tarabahoapp.ui.NavScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(navController: NavController) {

    val loginViewModel: LoginViewModel = viewModel()
    val context = LocalContext.current

    val logoutResult by loginViewModel.logoutResult.observeAsState()
    val logoutError by loginViewModel.logoutError.observeAsState()

    // Handle logout result and navigation
    LaunchedEffect(logoutResult) {
        logoutResult?.let { msg ->
            if (msg.isNotBlank()) {
                Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                // Navigate after showing toast
                navController.navigate("login") {
                    popUpTo(0) { inclusive = true }
                    launchSingleTop = true
                }
            }
        }
    }

    // Handle logout error - but still navigate to login
    LaunchedEffect(logoutError) {
        logoutError?.let { err ->
            if (err.isNotBlank()) {
                // Show a more user-friendly error message
                Toast.makeText(context, "Logout successful!", Toast.LENGTH_LONG).show()
                // Navigate to login anyway (local logout)
                navController.navigate("login") {
                    popUpTo(0) { inclusive = true }
                    launchSingleTop = true
                }
            }
        }
    }

    Scaffold(
        bottomBar = {
            MainNavigationBar(
                selectedScreen = NavScreen.Profile,
                onScreenSelected = { screen ->
                    when (screen) {
                        is NavScreen.Profile -> { /* Already on Profile, do nothing */ }
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
        ) {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF2962FF))
                    .padding(16.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { navController.navigateUp() },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                }

                Text(
                    text = "Settings",
                    color = Color.White,
                    fontSize = 16.sp,
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            // Small spacer after header
            Spacer(modifier = Modifier.height(8.dp))

            // Account settings group
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column {
                    Text(
                        text = "ACCOUNT",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Gray,
                        modifier = Modifier.padding(start = 16.dp, top = 16.dp, bottom = 8.dp)
                    )

                    SettingsItem(
                        icon = Icons.Default.Settings,
                        title = "Account Settings",
                        showArrow = true,
                        onClick = {
                            navController.navigate("profilesettings") {
                            }
                        },
                        showDivider = true
                    )
                }
            }

            // Legal settings group
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column {
                    Text(
                        text = "LEGAL",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Gray,
                        modifier = Modifier.padding(start = 16.dp, top = 16.dp, bottom = 8.dp)
                    )

                    SettingsItem(
                        icon = Icons.Default.Description,
                        title = "Terms and Conditions",
                        showArrow = true,
                        onClick = { /* Handle terms and conditions */ },
                        showDivider = true
                    )
                }
            }

            // Logout button
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                SettingsItem(
                    icon = Icons.Default.Logout,
                    title = "Log Out",
                    showArrow = false,
                    onClick = {
                        // Show immediate feedback
                        Toast.makeText(context, "Logging out...", Toast.LENGTH_SHORT).show()
                        loginViewModel.logout()
                        // Navigation is now handled in LaunchedEffect above
                    },
                    textColor = Color(0xFFE53935)
                )
            }
        }
    }
}

@Composable
fun SettingsItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    showArrow: Boolean,
    onClick: () -> Unit,
    showDivider: Boolean = false,
    textColor: Color = Color.DarkGray
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onClick)
                .padding(vertical = 12.dp, horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Color.Gray,
                modifier = Modifier.size(24.dp)
            )

            Text(
                text = title,
                fontSize = 16.sp,
                color = textColor,
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 16.dp)
            )

            if (showArrow) {
                Icon(
                    imageVector = Icons.Default.KeyboardArrowRight,
                    contentDescription = null,
                    tint = Color.Gray,
                    modifier = Modifier.size(24.dp)
                )
            }
        }

        if (showDivider) {
            Divider(
                color = Color(0xFFEEEEEE),
                thickness = 1.dp,
                modifier = Modifier.padding(start = 56.dp)
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun SettingsScreenPreview() {
    TarabahoTheme {
        SettingsScreen(rememberNavController())
    }
}