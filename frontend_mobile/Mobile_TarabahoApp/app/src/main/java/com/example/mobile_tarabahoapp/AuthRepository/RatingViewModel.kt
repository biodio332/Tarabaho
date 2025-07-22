package com.example.mobile_tarabahoapp.AuthRepository

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.model.Rating
import kotlinx.coroutines.launch

class RatingViewModel : ViewModel() {
    private val _ratings = MutableLiveData<List<Rating>>(emptyList())
    val ratings: LiveData<List<Rating>> get() = _ratings

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> get() = _error

    fun fetchRatingsByWorkerId(workerId: Long) {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.getRatingsByWorkerId(workerId)
                if (response.isSuccessful) {
                    _ratings.value = response.body() ?: emptyList()
                    _error.value = null
                } else {
                    _error.value = "Failed to fetch ratings: ${response.message()}"
                }
            } catch (e: Exception) {
                _error.value = "Error fetching ratings: ${e.message}"
            }
        }
    }
}