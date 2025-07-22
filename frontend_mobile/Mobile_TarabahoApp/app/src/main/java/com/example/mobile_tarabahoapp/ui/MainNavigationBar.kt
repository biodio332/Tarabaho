package com.example.mobile_tarabahoapp.ui

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

sealed class NavScreen(val route: String) {
    object Profile : NavScreen("settings")
    object Home : NavScreen("home")
    object Tasks : NavScreen("user_bookings")
}

@Composable
fun MainNavigationBar(
    selectedScreen: NavScreen,
    onScreenSelected: (NavScreen) -> Unit
) {
    NavigationBar(
        containerColor = Color.White,
        contentColor = Color(0xFF2962FF)
    ) {
        NavigationBarItem(
            icon = { Icon(Icons.Outlined.Person, contentDescription = "Profile") },
            selected = selectedScreen is NavScreen.Profile,
            onClick = { onScreenSelected(NavScreen.Profile) },
            colors = NavigationBarItemDefaults.colors(
                indicatorColor = Color.White,
                selectedIconColor = Color(0xFF2962FF),
                unselectedIconColor = Color.Gray
            )
        )
        NavigationBarItem(
            icon = { Icon(Icons.Outlined.Home, contentDescription = "Home") },
            selected = selectedScreen is NavScreen.Home,
            onClick = { onScreenSelected(NavScreen.Home) },
            colors = NavigationBarItemDefaults.colors(
                indicatorColor = Color.White,
                selectedIconColor = Color(0xFF2962FF),
                unselectedIconColor = Color.Gray
            )
        )
        NavigationBarItem(
            icon = { Icon(Icons.Outlined.Description, contentDescription = "Tasks") },
            selected = selectedScreen is NavScreen.Tasks,
            onClick = { onScreenSelected(NavScreen.Tasks) },
            colors = NavigationBarItemDefaults.colors(
                indicatorColor = Color.White,
                selectedIconColor = Color(0xFF2962FF),
                unselectedIconColor = Color.Gray
            )
        )
    }
} 