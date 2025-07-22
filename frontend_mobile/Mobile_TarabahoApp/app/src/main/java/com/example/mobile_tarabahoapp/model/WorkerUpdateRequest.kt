package com.example.mobile_tarabahoapp.model

data class WorkerUpdateRequest(
    val email: String?,
    val phoneNumber: String?,
    val address: String?,
    val birthday: String?,
    val biography: String?,
    val password: String?,
    val firstName: String?,  // optional, if you plan to allow editing these later
    val lastName: String?,
    val hourly: Double?
)
