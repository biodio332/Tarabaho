package com.example.mobile_tarabahoapp.model
import com.example.mobile_tarabahoapp.model.Certificate

data class Worker(
    val id: Long? = null,
    val username: String = "",
    val password: String = "",
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val phoneNumber: String? = null,
    val address: String? = null,
    val biography: String? = null,
    val birthday: String? = null,
    val profilePicture: String? = null,
    val hourly: Double? = null,
    val isAvailable: Boolean? = null,
    val isVerified: Boolean? = null,
    val stars: Double? = null,
    val ratingCount: Int? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val averageResponseTime: Double? = null, // Added for response time tracking
    val preferredRadius: Double? = null, // Added for service radius (optional, not in Worker.java)
    val categories: List<Category>? = null, // Added if you need category data
    val certificates: List<Certificate>? = null // Added if you need certificate data
)

