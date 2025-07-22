package com.example.mobile_tarabahoapp

import BookingDetailsScreen
import ChatViewModel
import MessagesScreen
import WorkerBookingDetailsScreen
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.mobile_tarabahoapp.AuthRepository.LoginViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.runtime.livedata.observeAsState
import androidx.navigation.NavController
import com.example.mobile_tarabahoapp.AuthRepository.BookingViewModel
import com.example.mobile_tarabahoapp.AuthRepository.ChatViewModelFactory
import com.example.mobile_tarabahoapp.ui.theme.TarabahoTheme
import com.example.mobile_tarabahoapp.utils.TokenManager
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TarabahoTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    val startDestination = if (TokenManager.isRememberMe() && TokenManager.getToken() != null) {
                        if (TokenManager.isWorker()) "worker_home" else "home"
                    } else {
                        "login"
                    }
                    NavHost(navController = navController, startDestination = startDestination) {
                        composable("login") {
                            LoginScreen(navController)
                        }
                        composable("signup") {
                            SignUpScreen(
                                navController = navController,
                                onSignUpSuccess = {
                                    navController.popBackStack()
                                    navController.navigate("login")
                                }
                            )
                        }
                        composable("home") {
                            HomeScreen(navController)
                        }
                        composable("settings") {
                            SettingsScreen(navController)
                        }
                        composable("edit_profile") {
                            EditProfileScreen(navController)
                        }
                        composable("worker_signin") {
                            WorkerSignInScreen(navController)
                        }
                        composable("worker_home") {
                            WorkerHomeScreen(navController)
                        }
                        composable(route = "profilesettings") {
                            EditProfileScreen(navController = navController)
                        }
                        composable("worker_edit_profile") {
                            WorkerEditProfileScreen(navController = navController)
                        }
                        composable(
                            route = "book_appointment/{workerId}/{category}",
                            arguments = listOf(
                                navArgument("workerId") { type = NavType.LongType },
                                navArgument("category") { type = NavType.StringType }
                            )
                        ) { backStackEntry ->
                            val workerId = backStackEntry.arguments?.getLong("workerId") ?: 0L
                            val category = backStackEntry.arguments?.getString("category") ?: "Cleaning"
                            BookAppointmentScreen(navController = navController, workerId = workerId, category = category)
                        }
                        composable("booking_status/{bookingId}") { backStackEntry ->
                            val bookingId = backStackEntry.arguments?.getString("bookingId") ?: ""
                            BookingStatusScreen(navController, bookingId = bookingId)
                        }
                        composable("booking_status_rejected") {
                            BookingStatusScreen(navController, initialStatus = BookingStatusState.REJECTED)
                        }
                        composable("booking_details/{bookingId}") { backStackEntry ->
                            val bookingId = backStackEntry.arguments?.getString("bookingId") ?: ""
                            BookingDetailsScreen(navController, bookingId = bookingId)
                        }
                        composable(
                            route = "worker_details/{workerId}/{category}",
                            arguments = listOf(
                                navArgument("workerId") { type = NavType.LongType },
                                navArgument("category") { type = NavType.StringType }
                            )
                        ) { backStackEntry ->
                            val workerId = backStackEntry.arguments?.getLong("workerId") ?: 0L
                            val category = backStackEntry.arguments?.getString("category") ?: "Cleaning"
                            WorkerDetailsScreen(navController = navController, workerId = workerId, category = category)
                        }
                        composable("rate_worker/{bookingId}") { backStackEntry ->
                            val bookingId = backStackEntry.arguments?.getString("bookingId")?.toLongOrNull() ?: 0L
                            RateWorkerScreen(navController = navController, bookingId = bookingId)
                        }
                        composable("worker_booking_details/{bookingId}") { backStackEntry ->
                            val bookingId = backStackEntry.arguments?.getString("bookingId")?.toLongOrNull() ?: 0L
                            WorkerBookingDetailsScreen(navController = navController, bookingId = bookingId)
                        }
                        composable("worker_register") {
                            WorkerRegisterScreen(navController)
                        }
                        composable("user_bookings") {
                            val bookingViewModel: BookingViewModel = viewModel()
                            UserBookingScreen(navController = navController, viewModel = bookingViewModel)
                        }
                        composable(
                            route = "chat/{bookingId}?currentUserId={currentUserId}&isWorker={isWorker}&chatTitle={chatTitle}",
                            arguments = listOf(
                                navArgument("bookingId") { type = NavType.LongType },
                                navArgument("currentUserId") {
                                    type = NavType.LongType
                                    defaultValue = 0L
                                },
                                navArgument("isWorker") {
                                    type = NavType.BoolType
                                    defaultValue = false
                                },
                                navArgument("chatTitle") {
                                    type = NavType.StringType
                                    defaultValue = "Chat"
                                }
                            )
                        ) { backStackEntry ->
                            val bookingId = backStackEntry.arguments?.getLong("bookingId") ?: 0L
                            val token = TokenManager.getToken() ?: ""
                            val factory = ChatViewModelFactory(bookingId, token)
                            val chatViewModel: ChatViewModel = viewModel(factory = factory)
                            MessagesScreen(
                                navController = navController,
                                chatViewModel = chatViewModel
                            )
                        }
                        composable("worker_reviews/{workerId}") { backStackEntry ->
                            val workerId = backStackEntry.arguments?.getString("workerId")?.toLong() ?: 0L
                            WorkerReviewsScreen(navController = navController, workerId = workerId)
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(navController: NavController, viewModel: LoginViewModel = viewModel()) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(TokenManager.isRememberMe()) }
    val loginResult by viewModel.loginResult.observeAsState()
    val loginError by viewModel.loginError.observeAsState()
    val context = LocalContext.current

    loginResult?.let { authResponse ->
        LaunchedEffect(authResponse) {
            Toast.makeText(context, "Login successful!", Toast.LENGTH_SHORT).show()
            navController.navigate("home") {
                popUpTo("login") { inclusive = true }
            }
        }
    }

    val errorMessage = loginError ?: ""
    if (errorMessage.isNotEmpty()) {
        LaunchedEffect(errorMessage) {
            Toast.makeText(context, errorMessage, Toast.LENGTH_LONG).show()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8F9FA))
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(240.dp)
                .background(Color(0xFF2962FF)),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "T A R A B A H",
                        color = Color.White,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search Icon",
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Tara Trabaho!",
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp)
                .offset(y = (-30).dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 12.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Welcome Back",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A1A1A),
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Text(
                    text = "Sign in to your account",
                    fontSize = 14.sp,
                    color = Color(0xFF666666),
                    modifier = Modifier.padding(bottom = 32.dp)
                )

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email or Username") },
                    placeholder = { Text("Enter your email") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedBorderColor = Color(0xFFE0E0E0),
                        focusedBorderColor = Color(0xFF2962FF),
                        unfocusedLabelColor = Color(0xFF666666),
                        focusedLabelColor = Color(0xFF2962FF)
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(20.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    placeholder = { Text("Enter your password") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedBorderColor = Color(0xFFE0E0E0),
                        focusedBorderColor = Color(0xFF2962FF),
                        unfocusedLabelColor = Color(0xFF666666),
                        focusedLabelColor = Color(0xFF2962FF)
                    ),
                    singleLine = true,
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = if (passwordVisible) "Hide password" else "Show password",
                                tint = Color(0xFF666666)
                            )
                        }
                    }
                )

                if (errorMessage.isNotEmpty()) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 16.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
                    ) {
                        Text(
                            text = errorMessage,
                            color = Color(0xFFD32F2F),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = rememberMe,
                            onCheckedChange = { rememberMe = it },
                            colors = CheckboxDefaults.colors(
                                checkedColor = Color(0xFF2962FF)
                            )
                        )
                        Text(
                            text = "Remember me",
                            fontSize = 14.sp,
                            color = Color(0xFF666666)
                        )
                    }

                    TextButton(onClick = { navController.navigate("worker_signin") }) {
                        Text(
                            text = "Switch to Worker?",
                            color = Color(0xFF2962FF),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))

                Button(
                    onClick = {
                        viewModel.login(email, password, rememberMe)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF2962FF)
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
                ) {
                    Text(
                        text = "Log In",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Don't have an account?",
                    fontSize = 14.sp,
                    color = Color(0xFF666666)
                )
                TextButton(onClick = { navController.navigate("signup") }) {
                    Text(
                        text = "Sign Up",
                        color = Color(0xFF2962FF),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoginScreenPreview() {
    TarabahoTheme {
        LoginScreen(rememberNavController())
    }
}