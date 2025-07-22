package com.example.mobile_tarabahoapp

import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import coil.compose.AsyncImage
import com.example.mobile_tarabahoapp.AuthRepository.WorkerViewModel
import com.example.mobile_tarabahoapp.model.Certificate
import com.example.mobile_tarabahoapp.model.WorkerUpdateRequest
import com.example.mobile_tarabahoapp.ui.theme.TarabahoTheme
import com.example.mobile_tarabahoapp.utils.TokenManager
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import android.webkit.MimeTypeMap
import androidx.core.net.toFile
import okhttp3.MediaType.Companion.toMediaTypeOrNull

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkerEditProfileScreen(navController: NavController) {
    val viewModel: WorkerViewModel = viewModel()
    val context = LocalContext.current

    // UI state
    var isLoading by remember { mutableStateOf(false) }
    var showSuccessMessage by remember { mutableStateOf(false) }
    var showLogoutDialog by remember { mutableStateOf(false) }
    var showCategoryRequestDialog by remember { mutableStateOf(false) }

    // Certificate state
    var fileError by remember { mutableStateOf<String?>(null) }
    var courseName by remember { mutableStateOf("") }
    var certificateNumber by remember { mutableStateOf("") }
    var issueDate by remember { mutableStateOf("") }
    var selectedFileUri by remember { mutableStateOf<Uri?>(null) }
    var showCertificateDatePicker by remember { mutableStateOf(false) }

    // Profile picture state
    var selectedProfilePictureUri by remember { mutableStateOf<Uri?>(null) }

    // Category request state
    var selectedCategories by remember { mutableStateOf<List<String>>(emptyList()) }

    LaunchedEffect(Unit) {
        val workerId = TokenManager.getWorkerId()
        if (workerId != -1L) {
            Log.d("WorkerEditProfileScreen", "Fetching worker with ID: $workerId")
            viewModel.fetchWorkerById(workerId.toString())
            viewModel.fetchCategories()
        } else {
            Log.e("WorkerEditProfileScreen", "Invalid worker ID")
        }
    }

    val updateSuccess by viewModel.updateSuccess.observeAsState()
    val certificateUploadSuccess by viewModel.certificateUploadSuccess.observeAsState()
    val profilePictureUploadSuccess by viewModel.profilePictureUploadSuccess.observeAsState()
    val categoryRequestSuccess by viewModel.categoryRequestSuccess.observeAsState()
    val categories by viewModel.categories.observeAsState(emptyList())
    val worker by viewModel.selectedWorker.observeAsState()

    // Handle Toast and Navigation
    LaunchedEffect(updateSuccess) {
        updateSuccess?.let {
            isLoading = false
            if (it) {
                showSuccessMessage = true
                Toast.makeText(context, "Profile updated successfully", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(context, "Failed to update profile", Toast.LENGTH_SHORT).show()
            }
        }
    }

    LaunchedEffect(certificateUploadSuccess) {
        certificateUploadSuccess?.let {
            isLoading = false
            if (it) {
                Toast.makeText(context, "Certificate uploaded successfully", Toast.LENGTH_SHORT).show()
                // Clear certificate fields
                courseName = ""
                certificateNumber = ""
                issueDate = ""
                selectedFileUri = null
                fileError = null
            } else {
                Toast.makeText(context, "Failed to upload certificate", Toast.LENGTH_SHORT).show()
            }
        }
    }

    LaunchedEffect(profilePictureUploadSuccess) {
        profilePictureUploadSuccess?.let {
            isLoading = false
            if (it) {
                Toast.makeText(context, "Profile picture uploaded successfully", Toast.LENGTH_SHORT).show()
                selectedProfilePictureUri = null
            } else {
                Toast.makeText(context, "Failed to upload profile picture", Toast.LENGTH_SHORT).show()
            }
        }
    }

    LaunchedEffect(categoryRequestSuccess) {
        categoryRequestSuccess?.let {
            if (it) {
                Toast.makeText(context, "Category request submitted successfully", Toast.LENGTH_SHORT).show()
                selectedCategories = emptyList()
                showCategoryRequestDialog = false
            } else {
                Toast.makeText(context, "Failed to submit category request. Check input or login.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    var email by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var birthday by remember { mutableStateOf("") }
    var biography by remember { mutableStateOf("") }
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    // State for password visibility
    var currentPasswordVisible by remember { mutableStateOf(false) }
    var newPasswordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }

    // State for date picker
    var showDatePicker by remember { mutableStateOf(false) }

    // State for validation errors
    var emailError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }
    var certificateError by remember { mutableStateOf<String?>(null) }

    // File picker launcher for certificate
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedFileUri = uri
        uri?.let {
            val mimeType = context.contentResolver.getType(it)
            val allowedMimeTypes = listOf("application/pdf", "image/jpeg", "image/png")
            Log.d("WorkerEditProfileScreen", "Attempting to select file: Uri=$uri, MIME=$mimeType")
            if (mimeType in allowedMimeTypes) {
                val workerId = TokenManager.getWorkerId()
                if (workerId != -1L) {
                    val file = File(context.cacheDir, "certificate_${System.currentTimeMillis()}")
                    context.contentResolver.openInputStream(uri)?.use { input ->
                        file.outputStream().use { output ->
                            input.copyTo(output)
                        }
                    }
                    // Get MIME type from Uri or file extension
                    val finalMimeType = mimeType ?: run {
                        val extension = MimeTypeMap.getFileExtensionFromUrl(uri.toString())
                        MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "application/octet-stream"
                    }
                    Log.d("WorkerEditProfileScreen", "Selected certificate file: Uri=$uri, File=${file.name}, Size=${file.length()} bytes, MIME=$finalMimeType")
                    selectedFileUri = uri
                    fileError = null
                } else {
                    Toast.makeText(context, "Invalid worker ID", Toast.LENGTH_SHORT).show()
                    selectedFileUri = null
                    fileError = null
                }
            } else {
                fileError = "Only PDF, JPEG, or PNG files are allowed"
                selectedFileUri = null
                Toast.makeText(context, fileError, Toast.LENGTH_SHORT).show()
                Log.w("WorkerEditProfileScreen", "Invalid file type: $mimeType")
            }
        } ?: run {
            Log.d("WorkerEditProfileScreen", "File selection cancelled: Uri is null")
            selectedFileUri = null
            fileError = null
        }
    }

    // File picker launcher for profile picture
    val profilePicturePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedProfilePictureUri = uri
        uri?.let {
            val workerId = TokenManager.getWorkerId()
            if (workerId != -1L) {
                isLoading = true
                val file = File(context.cacheDir, "profile_picture_${System.currentTimeMillis()}")
                context.contentResolver.openInputStream(uri)?.use { input ->
                    file.outputStream().use { output ->
                        input.copyTo(output)
                    }
                }
                // Get MIME type from Uri or file extension
                val mimeType = context.contentResolver.getType(uri) ?: run {
                    val extension = MimeTypeMap.getFileExtensionFromUrl(uri.toString())
                    MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "image/jpeg"
                }
                Log.d("WorkerEditProfileScreen", "Selected profile picture: Uri=$uri, File=${file.name}, Size=${file.length()} bytes, MIME=$mimeType")
                val requestFile = file.asRequestBody(mimeType.toMediaTypeOrNull())
                val filePart = MultipartBody.Part.createFormData("file", file.name, requestFile)
                viewModel.uploadProfilePicture(workerId, filePart)
            } else {
                Toast.makeText(context, "Invalid worker ID", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Function to validate email
    fun validateEmail(email: String): Boolean {
        val emailRegex = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+".toRegex()
        return if (email.matches(emailRegex)) {
            emailError = null
            true
        } else {
            emailError = "Please enter a valid email address"
            false
        }
    }

    // Function to validate passwords
    fun validatePasswords(): Boolean {
        return if (newPassword.isNotEmpty() && newPassword != confirmPassword) {
            passwordError = "Passwords do not match"
            false
        } else {
            passwordError = null
            true
        }
    }

    // Function to validate certificate fields
    fun validateCertificate(): Boolean {
        return if (courseName.isEmpty() || certificateNumber.isEmpty() || issueDate.isEmpty()) {
            certificateError = "All certificate fields are required"
            false
        } else {
            certificateError = null
            true
        }
    }

    // Function to handle save
    fun handleSave() {
        val isEmailValid = validateEmail(email)
        val arePasswordsValid = validatePasswords()
        val workerId = TokenManager.getWorkerId()

        if (workerId == -1L) {
            Toast.makeText(context, "Invalid worker ID", Toast.LENGTH_SHORT).show()
            return
        }

        if (isEmailValid && arePasswordsValid) {
            isLoading = true
            val updateRequest = WorkerUpdateRequest(
                email = email,
                phoneNumber = null,
                address = address,
                birthday = birthday,
                biography = biography,
                password = if (newPassword.isNotEmpty()) newPassword else null,
                firstName = null,
                lastName = null,
                hourly = null
            )
            viewModel.updateWorkerProfile(workerId, updateRequest)
        }
    }

    // Function to handle certificate upload
    fun handleCertificateUpload() {
        val workerId = TokenManager.getWorkerId()
        if (workerId == -1L) {
            Toast.makeText(context, "Invalid worker ID", Toast.LENGTH_SHORT).show()
            return
        }

        if (!validateCertificate()) {
            return
        }

        isLoading = true
        val certificate = Certificate(
            courseName = courseName,
            certificateNumber = certificateNumber,
            issueDate = issueDate
        )

        // Create MultipartBody.Part for file
        val filePart: MultipartBody.Part? = selectedFileUri?.let { uri ->
            val file = File(context.cacheDir, "certificate_${System.currentTimeMillis()}")
            context.contentResolver.openInputStream(uri)?.use { input ->
                file.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
            // Get MIME type from Uri
            val mimeType = context.contentResolver.getType(uri) ?: run {
                val extension = MimeTypeMap.getFileExtensionFromUrl(uri.toString())
                MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "application/octet-stream"
            }
            Log.d("WorkerEditProfileScreen", "Uploading certificate: File=${file.name}, Size=${file.length()} bytes, MIME=$mimeType")
            val requestFile = file.asRequestBody(mimeType.toMediaTypeOrNull())
            MultipartBody.Part.createFormData("certificateFile", file.name, requestFile)
        }

        viewModel.uploadCertificate(workerId, certificate, filePart)
    }

    var initialized by remember { mutableStateOf(false) }

    LaunchedEffect(worker) {
        worker?.let {
            if (!initialized) {
                email = it.email ?: ""
                address = it.address ?: ""
                birthday = it.birthday ?: ""
                biography = it.biography ?: ""
                initialized = true
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        // Main content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Header with gradient background
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(
                                Color(0xFF1E88E5),
                                Color(0xFF2962FF)
                            ),
                            start = Offset(0f, 0f),
                            end = Offset(Float.POSITIVE_INFINITY, 300f)
                        )
                    )
            ) {
                // Back button
                IconButton(
                    onClick = { navController.navigateUp() },
                    modifier = Modifier
                        .padding(16.dp)
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.2f))
                        .align(Alignment.TopStart)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }

                // More options menu
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(16.dp)
                ) {
                    var expanded by remember { mutableStateOf(false) }

                    IconButton(
                        onClick = { expanded = true },
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f))
                    ) {
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = "More Options",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    DropdownMenu(
                        expanded = expanded,
                        onDismissRequest = { expanded = false }
                    ) {
                        DropdownMenuItem(
                            text = {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Logout,
                                        contentDescription = "Logout",
                                        tint = Color(0xFFE53935)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        "Logout",
                                        color = Color(0xFFE53935)
                                    )
                                }
                            },
                            onClick = {
                                expanded = false
                                showLogoutDialog = true
                            }
                        )
                    }
                }

                // Title
                Column(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "TARABAHO!",
                        color = Color.White,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Worker Profile",
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Profile picture section with verification badge
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .offset(y = (-60).dp),
                contentAlignment = Alignment.TopCenter
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Worker profile picture
                    Box(
                        modifier = Modifier
                            .size(120.dp)
                    ) {
                        // Profile picture
                        Box(
                            modifier = Modifier
                                .size(120.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .border(4.dp, Color.White, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            worker?.profilePicture?.let { profilePictureUrl ->
                                key(profilePictureUrl) {
                                    AsyncImage(
                                        model = "$profilePictureUrl?cache=${System.currentTimeMillis()}",
                                        contentDescription = "Worker Profile Picture",
                                        modifier = Modifier
                                            .size(120.dp)
                                            .clip(CircleShape),
                                        contentScale = ContentScale.Crop
                                    )
                                }
                            } ?: run {
                                // Fallback to Engineering icon
                                Icon(
                                    imageVector = Icons.Default.Engineering,
                                    contentDescription = "Worker Icon",
                                    tint = Color(0xFF2962FF),
                                    modifier = Modifier.size(64.dp)
                                )
                            }

                            // Worker icon overlay
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .align(Alignment.TopEnd)
                                    .clip(CircleShape)
                                    .background(Color(0xFF2962FF))
                                    .border(2.dp, Color.White, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Engineering,
                                    contentDescription = "Worker",
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Edit Profile Picture Button
                    Button(
                        onClick = { profilePicturePickerLauncher.launch("image/*") },
                        modifier = Modifier
                            .width(200.dp)
                            .height(40.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2962FF)
                        ),
                        enabled = !isLoading
                    ) {
                        Text(
                            text = if (selectedProfilePictureUri != null) "Picture Selected" else "Edit Profile Picture",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Verification status
                    worker?.let {
                        Card(
                            modifier = Modifier
                                .padding(top = 4.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (it.isVerified == true) Color(0xFFE8F5E9) else Color(0xFFFFEBEE)
                            )
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = if (it.isVerified == true) Icons.Default.Verified else Icons.Default.ErrorOutline,
                                    contentDescription = if (it.isVerified == true) "Verified" else "Not Verified",
                                    tint = if (it.isVerified == true) Color(0xFF4CAF50) else Color(0xFFE53935),
                                    modifier = Modifier.size(16.dp)
                                )

                                Spacer(modifier = Modifier.width(4.dp))

                                Text(
                                    text = if (it.isVerified == true) "Verified Worker" else "Not Verified",
                                    color = if (it.isVerified == true) Color(0xFF4CAF50) else Color(0xFFE53935),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Worker Profile",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            // Success message
            AnimatedVisibility(
                visible = showSuccessMessage,
                enter = fadeIn(animationSpec = tween(300)),
                exit = fadeOut(animationSpec = tween(300))
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Success",
                            tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(24.dp)
                        )

                        Spacer(modifier = Modifier.width(16.dp))

                        Text(
                            text = "Profile updated successfully!",
                            color = Color(0xFF4CAF50),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Personal Information Section
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .offset(y = (-40).dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 24.dp)
                ) {
                    // Section title
                    Text(
                        text = "Personal Information",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2962FF),
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    // Email Field
                    OutlinedTextField(
                        value = email,
                        onValueChange = {
                            email = it
                            if (emailError != null) validateEmail(it)
                        },
                        label = { Text("Email") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Email,
                                contentDescription = "Email",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        isError = emailError != null,
                        supportingText = {
                            if (emailError != null) {
                                Text(text = emailError!!, color = MaterialTheme.colorScheme.error)
                            }
                        }
                    )

                    // Address Field
                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Address") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = "Address",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        )
                    )

                    // Birthday Field
                    OutlinedTextField(
                        value = birthday,
                        onValueChange = { /* Handled by date picker */ },
                        label = { Text("Birthday") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Cake,
                                contentDescription = "Birthday",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { showDatePicker = true }) {
                                Icon(
                                    imageVector = Icons.Default.CalendarMonth,
                                    contentDescription = "Select Date",
                                    tint = Color.Gray
                                )
                            }
                        },
                        readOnly = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        )
                    )

                    // Biography Field
                    OutlinedTextField(
                        value = biography,
                        onValueChange = { biography = it },
                        label = { Text("Biography") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Description,
                                contentDescription = "Biography",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp)
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        ),
                        maxLines = 5
                    )
                }
            }

            // Change Password Section
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .offset(y = (-32).dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 24.dp)
                ) {
                    // Section title
                    Text(
                        text = "Change Password",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2962FF),
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    // Current Password Field
                    OutlinedTextField(
                        value = currentPassword,
                        onValueChange = { currentPassword = it },
                        label = { Text("Current Password") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Current Password",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { currentPasswordVisible = !currentPasswordVisible }) {
                                Icon(
                                    imageVector = if (currentPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                    contentDescription = if (currentPasswordVisible) "Hide Password" else "Show Password",
                                    tint = Color.Gray
                                )
                            }
                        },
                        visualTransformation = if (currentPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        )
                    )

                    // New Password Field
                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = {
                            newPassword = it
                            if (passwordError != null) validatePasswords()
                        },
                        label = { Text("New Password") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "New Password",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { newPasswordVisible = !newPasswordVisible }) {
                                Icon(
                                    imageVector = if (newPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                    contentDescription = if (newPasswordVisible) "Hide Password" else "Show Password",
                                    tint = Color.Gray
                                )
                            }
                        },
                        visualTransformation = if (newPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        )
                    )

                    // Confirm Password Field
                    OutlinedTextField(
                        value = confirmPassword,
                        onValueChange = {
                            confirmPassword = it
                            if (passwordError != null) validatePasswords()
                        },
                        label = { Text("Confirm New Password") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Confirm New Password",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                                Icon(
                                    imageVector = if (confirmPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                    contentDescription = if (confirmPasswordVisible) "Hide Password" else "Show Password",
                                    tint = Color.Gray
                                )
                            }
                        },
                        visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        isError = passwordError != null,
                        supportingText = {
                            if (passwordError != null) {
                                Text(text = passwordError!!, color = MaterialTheme.colorScheme.error)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        )
                    )
                }
            }

            // Save Button
            Button(
                onClick = { handleSave() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .padding(horizontal = 16.dp)
                    .offset(y = (-16).dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF2962FF)
                ),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = "Save Changes",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Certificate Upload Section
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .offset(y = (-8).dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 24.dp)
                ) {
                    // Section title
                    Text(
                        text = "Add Certificate",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2962FF),
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    // Course Name
                    OutlinedTextField(
                        value = courseName,
                        onValueChange = { courseName = it },
                        label = { Text("Course Name") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.School,
                                contentDescription = "Course Name",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        ),
                        isError = certificateError != null
                    )

                    // Certificate Number
                    OutlinedTextField(
                        value = certificateNumber,
                        onValueChange = { certificateNumber = it },
                        label = { Text("Certificate Number") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.ConfirmationNumber,
                                contentDescription = "Certificate Number",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        ),
                        isError = certificateError != null
                    )

                    // Issue Date
                    OutlinedTextField(
                        value = issueDate,
                        onValueChange = { /* Handled by date picker */ },
                        label = { Text("Issue Date") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.CalendarMonth,
                                contentDescription = "Issue Date",
                                tint = Color(0xFF2962FF)
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { showCertificateDatePicker = true }) {
                                Icon(
                                    imageVector = Icons.Default.CalendarMonth,
                                    contentDescription = "Select Date",
                                    tint = Color.Gray
                                )
                            }
                        },
                        readOnly = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = Color.LightGray,
                            focusedBorderColor = Color(0xFF2962FF)
                        ),
                        isError = certificateError != null
                    )

                    // File Picker Button
                    Button(
                        onClick = { filePickerLauncher.launch("*/*") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2962FF)
                        )
                    ) {
                        Text(
                            text = if (selectedFileUri != null) "File Selected" else "Choose Certificate File",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    // File Error
                    if (fileError != null) {
                        Text(
                            text = fileError!!,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                    }

                    // Certificate Error
                    if (certificateError != null) {
                        Text(
                            text = certificateError!!,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(bottom = 16.dp)
                        )
                    }

                    // Upload Certificate Button
                    Button(
                        onClick = { handleCertificateUpload() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2962FF)
                        ),
                        enabled = !isLoading
                    ) {
                        if (isLoading && selectedFileUri != null) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Upload Certificate",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            // Request Category Button (Conditional)
            worker?.let { workerData ->
                if (workerData.isVerified == true) {
                    Button(
                        onClick = { showCategoryRequestDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .padding(horizontal = 16.dp)
                            .offset(y = (-8).dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF2962FF)
                        ),
                        enabled = !isLoading
                    ) {
                        Text(
                            text = "Request Category",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Cancel Button
            OutlinedButton(
                onClick = { navController.navigateUp() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .padding(horizontal = 16.dp)
                    .offset(y = (-8).dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color(0xFF2962FF)
                ),
                border = BorderStroke(1.dp, Color(0xFF2962FF)),
                enabled = !isLoading
            ) {
                Text(
                    text = "Back",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            // Footer
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "© 2025 Tarabaho! All rights reserved.",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center
                )
            }
        }
    }

    // Date Picker Dialog for Birthday
    if (showDatePicker) {
        val datePickerState = rememberDatePickerState()

        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        datePickerState.selectedDateMillis?.let {
                            val localDate = java.time.Instant.ofEpochMilli(it)
                                .atZone(java.time.ZoneId.systemDefault())
                                .toLocalDate()
                            birthday = localDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
                        }
                        showDatePicker = false
                    }
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showDatePicker = false }
                ) {
                    Text("Cancel")
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    // Date Picker Dialog for Certificate Issue Date
    if (showCertificateDatePicker) {
        val datePickerState = rememberDatePickerState()

        DatePickerDialog(
            onDismissRequest = { showCertificateDatePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        datePickerState.selectedDateMillis?.let {
                            val localDate = java.time.Instant.ofEpochMilli(it)
                                .atZone(java.time.ZoneId.systemDefault())
                                .toLocalDate()
                            issueDate = localDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
                        }
                        showCertificateDatePicker = false
                    }
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showCertificateDatePicker = false }
                ) {
                    Text("Cancel")
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    // Category Request Dialog
    if (showCategoryRequestDialog) {
        AlertDialog(
            onDismissRequest = {
                showCategoryRequestDialog = false
                selectedCategories = emptyList()
            },
            title = {
                Text(
                    "Request Category",
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column {
                    Text("Select categories to request:")
                    Spacer(modifier = Modifier.height(8.dp))
                    MultiSelectDropdown(
                        categories = categories,
                        selectedCategories = selectedCategories,
                        onCategorySelected = { categoryName ->
                            selectedCategories = if (selectedCategories.contains(categoryName)) {
                                selectedCategories - categoryName
                            } else {
                                selectedCategories + categoryName
                            }
                        },
                        workerCategories = worker?.categories?.map { it.name } ?: emptyList()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (selectedCategories.isNotEmpty()) {
                            val workerId = TokenManager.getWorkerId()
                            if (workerId != -1L) {
                                viewModel.requestCategory(workerId, selectedCategories)
                            } else {
                                Toast.makeText(context, "Invalid worker ID", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            Toast.makeText(context, "Please select at least one category", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF2962FF)
                    )
                ) {
                    Text("Submit")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = {
                        showCategoryRequestDialog = false
                        selectedCategories = emptyList()
                    },
                    border = BorderStroke(1.dp, Color.Gray)
                ) {
                    Text("Cancel")
                }
            }
        )
    }

    // Logout Confirmation Dialog
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = {
                Text(
                    "Logout",
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Text("Are you sure you want to logout from your worker account?")
            },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        TokenManager.clearToken()
                        TokenManager.saveWorkerId(-1)
                        Toast.makeText(context, "Logged out successfully", Toast.LENGTH_SHORT).show()
                        navController.navigate("worker_signin") {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFE53935)
                    )
                ) {
                    Text("Logout")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { showLogoutDialog = false },
                    border = BorderStroke(1.dp, Color.Gray)
                ) {
                    Text("Cancel")
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MultiSelectDropdown(
    categories: List<com.example.mobile_tarabahoapp.model.Category>,
    selectedCategories: List<String>,
    onCategorySelected: (String) -> Unit,
    workerCategories: List<String>
) {
    var expanded by remember { mutableStateOf(false) }
    val filteredCategories = categories.filter { !workerCategories.contains(it.name) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded }
    ) {
        OutlinedTextField(
            value = if (selectedCategories.isEmpty()) "Select categories" else selectedCategories.joinToString(", "),
            onValueChange = {},
            readOnly = true,
            label = { Text("Categories") },
            trailingIcon = {
                ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
            },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Color.LightGray,
                focusedBorderColor = Color(0xFF2962FF)
            )
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            filteredCategories.forEach { category ->
                DropdownMenuItem(
                    text = { Text(category.name) },
                    onClick = { onCategorySelected(category.name) },
                    leadingIcon = {
                        Checkbox(
                            checked = selectedCategories.contains(category.name),
                            onCheckedChange = { onCategorySelected(category.name) }
                        )
                    }
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun WorkerEditProfileScreenPreview() {
    TarabahoTheme {
        WorkerEditProfileScreen(rememberNavController())
    }
}