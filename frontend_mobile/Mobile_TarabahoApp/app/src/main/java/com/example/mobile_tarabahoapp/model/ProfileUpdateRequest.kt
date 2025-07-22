package com.example.mobile_tarabahoapp.model

data class ProfileUpdateRequest(
    val firstName: String?,
    val lastName: String?,
    val username: String?,
    val email: String?,
    val phoneNumber: String?,
    val birthday: String?, // format: "YYYY-MM-DD"
    val location: String?,
    val password: String?
)