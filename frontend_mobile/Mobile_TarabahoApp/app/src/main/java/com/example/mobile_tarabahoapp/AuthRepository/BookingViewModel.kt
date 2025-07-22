package com.example.mobile_tarabahoapp.AuthRepository

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mobile_tarabahoapp.api.RetrofitClient
import com.example.mobile_tarabahoapp.model.Booking
import com.example.mobile_tarabahoapp.model.CategoryBookingRequest
import com.example.mobile_tarabahoapp.model.CompleteBookingRequest
import com.example.mobile_tarabahoapp.model.PaymentMethod
import com.example.mobile_tarabahoapp.model.RatingRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class BookingViewModel : ViewModel() {

    private val api = RetrofitClient.apiService
    val activeBookings = MutableLiveData<List<Booking>>()
    val pastBookings = MutableLiveData<List<Booking>>()
    val error = MutableLiveData<String>()
    val selectedBooking = MutableLiveData<Booking?>()

    private val _userBookings = MutableLiveData<List<Booking>>()
    val userBookings: LiveData<List<Booking>> = _userBookings

    private val _userBookingError = MutableLiveData<String?>()
    val userBookingError: LiveData<String?> = _userBookingError

    fun fetchWorkerBookings() {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                val response = api.getWorkerBookings()
                if (response.isSuccessful) {
                    val bookings = response.body() ?: emptyList()
                    activeBookings.value = bookings.filter {
                        it.status in listOf("PENDING", "ACCEPTED", "IN_PROGRESS", "WORKER_COMPLETED")
                    }
                    pastBookings.value = bookings.filter {
                        it.status in listOf("REJECTED", "CANCELLED", "COMPLETED")
                    }
                } else {
                    error.value = "⚠️ Failed to load bookings: ${response.code()}"
                }
            } catch (e: Exception) {
                error.value = "⚠️ ${e.localizedMessage ?: "Network error"}"
            }
        }
    }

    fun fetchUserBookings() {
        viewModelScope.launch {
            try {
                val response = api.getUserBookings()
                if (response.isSuccessful) {
                    _userBookings.postValue(response.body() ?: emptyList())
                } else {
                    val msg = response.errorBody()?.string() ?: "Failed to fetch bookings"
                    _userBookingError.postValue(msg)
                }
            } catch (e: Exception) {
                _userBookingError.postValue("Error: ${e.localizedMessage}")
            }
        }
    }

    fun acceptBooking(bookingId: Long) {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                val response = api.acceptBooking(bookingId)
                if (response.isSuccessful) {
                    if (response.body() != null) {
                        updateBookingStatus(bookingId, "ACCEPTED")
                        getBookingById(bookingId)
                    } else {
                        Log.e("BookingViewModel", "Accept booking: No booking data returned")
                    }
                }
            } catch (e: Exception) {
                Log.e("BookingViewModel", "Accept error: ${e.message}")
            }
        }
    }

    fun rejectBooking(bookingId: Long) {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                val response = api.rejectBooking(bookingId)
                if (response.isSuccessful) {
                    if (response.body() != null) {
                        updateBookingStatus(bookingId, "REJECTED")
                    } else {
                        Log.e("BookingViewModel", "Reject booking: No booking data returned")
                    }
                }
            } catch (e: Exception) {
                Log.e("BookingViewModel", "Reject error: ${e.message}")
            }
        }
    }

    fun completeBooking(bookingId: Long, amount: Double, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                // Validate amount before sending
                if (amount <= 0) {
                    onError("Amount must be greater than 0")
                    return@launch
                }
                val request = CompleteBookingRequest(amount)
                val response = api.completeBooking(bookingId, request)
                if (response.isSuccessful) {
                    if (response.body() != null) {
                        updateBookingStatus(bookingId, "WORKER_COMPLETED")
                        getBookingById(bookingId)
                        onSuccess()
                    } else {
                        onError("Failed to complete booking. Please try again.")
                    }
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    Log.e("BookingViewModel", "CompleteBooking Error Response: $errorBody (Code: ${response.code()})")
                    onError("Failed to complete booking. Please try again.")
                }
            } catch (e: HttpException) {
                val errorBody = e.response()?.errorBody()?.string() ?: "HTTP error"
                Log.e("BookingViewModel", "CompleteBooking HTTP Exception: $errorBody")
                onError("Failed to complete booking. Please try again.")
            } catch (e: IOException) {
                Log.e("BookingViewModel", "CompleteBooking Network Exception: ${e.message}")
                onError("Network error. Please check your connection.")
            } catch (e: Exception) {
                Log.e("BookingViewModel", "CompleteBooking Exception: ${e.message}")

            }
        }
    }

    fun confirmPayment(bookingId: Long, amount: Double, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                // Validate amount before sending
                if (amount <= 0) {
                    onError("Amount must be greater than 0")
                    return@launch
                }
                val request = CompleteBookingRequest(amount)
                val response = api.confirmPayment(bookingId, request)
                if (response.isSuccessful) {
                    if (response.body() != null) {
                        getBookingById(bookingId)
                        onSuccess()
                    } else {
                        onError("Failed to confirm payment. Please try again.")
                    }
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    Log.e("BookingViewModel", "ConfirmPayment Error Response: $errorBody (Code: ${response.code()})")
                    onError("Failed to confirm payment. Please try again.")
                }
            } catch (e: HttpException) {
                val errorBody = e.response()?.errorBody()?.string() ?: "HTTP error"
                Log.e("BookingViewModel", "ConfirmPayment HTTP Exception: $errorBody")
                onError("Failed to confirm payment. Please try again.")
            } catch (e: IOException) {
                Log.e("BookingViewModel", "ConfirmPayment Network Exception: ${e.message}")
                onError("Network error. Please check your connection.")
            } catch (e: Exception) {
                Log.e("BookingViewModel", "ConfirmPayment Exception: ${e.message}")

            }
        }
    }

    private fun updateBookingStatus(bookingId: Long, newStatus: String) {
        val updatedActive = activeBookings.value?.map {
            if (it.id == bookingId) it.copy(status = newStatus) else it
        } ?: emptyList()

        val updatedPast = pastBookings.value?.map {
            if (it.id == bookingId) it.copy(status = newStatus) else it
        } ?: emptyList()

        activeBookings.value = updatedActive.filter {
            it.status in listOf("PENDING", "ACCEPTED", "IN_PROGRESS", "WORKER_COMPLETED")
        } + updatedPast.filter {
            it.status in listOf("PENDING", "ACCEPTED", "IN_PROGRESS", "WORKER_COMPLETED")
        }

        pastBookings.value = updatedActive.filter {
            it.status in listOf("REJECTED", "CANCELLED", "COMPLETED")
        } + updatedPast.filter {
            it.status in listOf("REJECTED", "CANCELLED", "COMPLETED")
        }
    }

    fun createBooking(
        workerId: Long,
        categoryName: String,
        paymentMethod: PaymentMethod,
        jobDetails: String,
        onSuccess: (Long) -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            try {
                val request = CategoryBookingRequest(workerId, categoryName, paymentMethod, jobDetails)
                val response = api.createCategoryBooking(request)
                if (response.isSuccessful) {
                    val booking = response.body()
                    if (booking != null) {
                        onSuccess(booking.id)
                    } else {
                        onError("Booking failed: No booking data returned")
                    }
                } else {
                    onError("Booking failed: ${response.code()}")
                }
            } catch (e: Exception) {
                onError(e.message ?: "Unknown error")
            }
        }
    }

    fun checkBookingStatus(bookingId: Long, onStatusFetched: (String) -> Unit) {
        viewModelScope.launch {
            try {
                val response = api.getBookingStatus(bookingId)
                if (response.isSuccessful) {
                    response.body()?.let { statusResponse ->
                        onStatusFetched(statusResponse.status)
                    } ?: Log.e("BookingViewModel", "Check status: No status data returned")
                }
            } catch (e: Exception) {
                Log.e("BookingViewModel", "Status check error: ${e.message}")
            }
        }
    }

    fun getBookingById(bookingId: Long) {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                val response = api.getBookingById(bookingId)
                if (response.isSuccessful) {
                    selectedBooking.value = response.body()
                } else {
                    selectedBooking.value = null
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    Log.e("BookingViewModel", "Get booking error: $errorBody (Code: ${response.code()})")
                }
            } catch (e: Exception) {
                selectedBooking.value = null
                Log.e("BookingViewModel", "Get booking error: ${e.message}")
            }
        }
    }

    fun startBooking(bookingId: Long, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                val response = api.startBooking(bookingId)
                if (response.isSuccessful) {
                    if (response.body() != null) {
                        getBookingById(bookingId)
                        onSuccess()
                    } else {
                        onError("Failed to start booking. Please try again.")
                    }
                } else {
                    Log.e("BookingViewModel", "StartBooking Error Response: ${response.code()}")
                    onError("Failed to start booking. Please try again.")
                }
            } catch (e: Exception) {
                Log.e("BookingViewModel", "StartBooking Exception: ${e.message}")

            }
        }
    }

    fun acceptCompletion(bookingId: Long, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                val response = api.acceptCompletion(bookingId)
                if (response.isSuccessful) {
                    if (response.body() != null) {
                        updateBookingStatus(bookingId, "COMPLETED")
                        getBookingById(bookingId)
                        onSuccess()
                    } else {
                        onError("Failed to complete the booking. Please try again.")
                    }
                } else {
                    Log.e("BookingViewModel", "AcceptCompletion Error Response: ${response.code()}")
                    onError("Failed to complete the booking. Please try again.")
                }
            } catch (e: Exception) {
                Log.e("BookingViewModel", "AcceptCompletion Exception: ${e.message}")

            }
        }
    }

    fun submitRating(bookingId: Long, rating: Int, comment: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            try {
                val request = RatingRequest(bookingId, rating, comment)
                val response = api.submitRating(request)
                if (response.isSuccessful) {
                    onSuccess()
                } else {
                    onError("Failed to submit rating: ${response.code()}")
                }
            } catch (e: Exception) {
                onError(e.message ?: "Unknown error")
            }
        }
    }

    fun cancelBooking(bookingId: Long, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                val response = api.cancelBooking(bookingId)
                if (response.isSuccessful) {
                    if (response.body() != null) {
                        onResult(true, "Booking cancelled successfully.")
                        fetchWorkerBookings()
                    } else {
                        onResult(false, "Failed to cancel booking: No booking data returned")
                    }
                } else {
                    onResult(false, "Failed to cancel booking: ${response.code()}")
                }
            } catch (e: Exception) {
                onResult(false, "Error: ${e.localizedMessage}")
            }
        }
    }

    fun markBookingInProgress(bookingId: Long, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch(Dispatchers.Main) {
            try {
                val response = api.markBookingInProgress(bookingId)
                if (response.isSuccessful) {
                    if (response.body() != null) {
                        updateBookingStatus(bookingId, "IN_PROGRESS")
                        getBookingById(bookingId)
                        onSuccess()
                    } else {
                        onError("Failed to revert booking. Please try again.")
                    }
                } else {
                    Log.e("BookingViewModel", "MarkBookingInProgress Error Response: ${response.code()}")
                    onError("Failed to revert booking. Please try again.")
                }
            } catch (e: Exception) {
                Log.e("BookingViewModel", "MarkBookingInProgress Exception: ${e.message}")

            }
        }
    }
}