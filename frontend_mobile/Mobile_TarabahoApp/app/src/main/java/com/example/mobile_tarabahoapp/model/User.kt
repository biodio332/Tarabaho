package com.example.mobile_tarabahoapp.model

data class User(
    val id: Long,
    val firstname: String,
    val lastname: String,
    val username: String,
    val password: String,
    val email: String,
    val phoneNumber: String? = null,
    val location: String? = null,
    val birthday: String? = null,
    val profilePicture: String? = null,
    val isVerified: Boolean = false,
    val latitude: Double? = null, // Added for geolocation
    val longitude: Double? = null, // Added for geolocation
    val preferredRadius: Double? = null // Added for preferred service radius
)