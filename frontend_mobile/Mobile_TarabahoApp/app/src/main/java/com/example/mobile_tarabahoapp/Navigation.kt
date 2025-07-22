package com.example.mobile_tarabahoapp

import BookingDetailsScreen
import WorkerBookingDetailsScreen
import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.mobile_tarabahoapp.AuthRepository.BookingViewModel
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.api.chat.ChatRepository
import com.example.mobile_tarabahoapp.utils.TokenManager

@Composable
fun AppNavigation(navController: NavHostController) {
    NavHost(navController = navController, startDestination = "splash") {
        composable("signup") {
            SignUpScreen(
                navController = navController,
                onSignUpSuccess = {
                    navController.popBackStack()
                    navController.navigate("login")
                }
            )
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
        composable("login") {
            LoginScreen(navController)
        }
        composable("home") {
            HomeScreen(navController)
        }
        composable("settings") {
            SettingsScreen(navController)
        }
        composable(route = "profilesettings") {
            EditProfileScreen(navController = navController)
        }

        composable("worker_signin") {
            WorkerSignInScreen(navController)
        }
        composable("worker_home") {
            WorkerHomeScreen(navController)
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
        composable("booking_details/{bookingId}") { backStackEntry ->
            val bookingId = backStackEntry.arguments?.getString("bookingId") ?: ""
            BookingDetailsScreen(navController, bookingId = bookingId)
        }
        composable("booking_status_rejected") {
            BookingStatusScreen(
                navController = navController,
                initialStatus = BookingStatusState.REJECTED
            )
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
    }
}