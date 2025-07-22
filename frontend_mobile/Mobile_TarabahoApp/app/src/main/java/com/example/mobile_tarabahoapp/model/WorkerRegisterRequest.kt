package com.example.mobile_tarabahoapp.model

data class WorkerRegisterRequest(
    val username: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val phoneNumber: String?,
    val birthday: String?, // Format: "YYYY-MM-DD"
    val address: String?,
    val hourly: Double
)
