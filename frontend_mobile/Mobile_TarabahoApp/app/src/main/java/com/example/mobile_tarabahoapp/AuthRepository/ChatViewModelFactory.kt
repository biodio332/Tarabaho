package com.example.mobile_tarabahoapp.AuthRepository

import ChatViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider

class ChatViewModelFactory(
    private val bookingId: Long,
    private val token: String
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ChatViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ChatViewModel(bookingId, token) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
