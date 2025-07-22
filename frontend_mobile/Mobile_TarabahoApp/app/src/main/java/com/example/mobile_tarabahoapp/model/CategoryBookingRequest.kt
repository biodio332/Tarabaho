package com.example.mobile_tarabahoapp.model

data class CategoryBookingRequest(
    val workerId: Long,
    val categoryName: String,
    val paymentMethod: PaymentMethod,
    val jobDetails: String
)
