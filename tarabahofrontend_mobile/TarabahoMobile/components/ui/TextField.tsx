import { useState, forwardRef } from "react"
import { View, Text, TextInput, StyleSheet, type TextInputProps, TouchableWithoutFeedback, Keyboard } from "react-native"

type TextFieldProps = {
  label?: string
  error?: string
  helperText?: string
  containerStyle?: any
  inputStyle?: any
} & TextInputProps

const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, helperText, containerStyle, inputStyle, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const hasError = !!(error && error.length > 0)

    const getBorderStyle = () => {
      if (hasError) return styles.borderError
      if (focused) return styles.borderFocused
      return styles.borderDefault
    }

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={[styles.inputContainer, getBorderStyle()]}>
            <TextInput
              ref={ref}
              style={[styles.input, inputStyle]}
              placeholderTextColor="#9ca3af"
              onFocus={(e) => {
                setFocused(true)
                onFocus?.(e)
              }}
              onBlur={(e) => {
                setFocused(false)
                onBlur?.(e)
              }}
              autoCorrect={props.autoCorrect ?? false}
              // 👇 ensures keyboard shows up
              editable={props.editable ?? true}
              keyboardType={props.keyboardType ?? "default"}
              returnKeyType={props.returnKeyType ?? "done"}
              blurOnSubmit={props.blurOnSubmit ?? true}
              // Additional keyboard handling props
              autoCapitalize={props.autoCapitalize ?? "none"}
              autoComplete={props.autoComplete ?? "off"}
              textContentType={props.textContentType}
              enablesReturnKeyAutomatically={true}
              clearButtonMode="while-editing"
              {...props}
            />
          </View>
        </TouchableWithoutFeedback>
        {hasError ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    )
  }
)

TextField.displayName = "TextField"

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    minHeight: 56,
    backgroundColor: "#ffffff",
  },
  borderDefault: {
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  borderFocused: {
    borderColor: "#3b82f6",
    backgroundColor: "#ffffff",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  borderError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
    shadowColor: "#ef4444",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 6,
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "500",
  },
  helperText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "400",
  },
})

export default TextField
