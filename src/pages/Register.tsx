import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import api from '../api/axios'

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        try {
            await api.post('/auth/register/', {
                username: formData.email, // Using email as username
                email: formData.email,
                password: formData.password
            })
            // Auto login after register
            const response = await api.post('/token/', {
                username: formData.email,
                password: formData.password
            })
            localStorage.setItem('access_token', response.data.access)
            localStorage.setItem('refresh_token', response.data.refresh)
            navigate('/dashboard')
        } catch (err: any) {
            console.error('Registration failed', err)
            setError('Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const passwordStrength = (password: string) => {
        let strength = 0
        if (password.length >= 8) strength++
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
        if (/\d/.test(password)) strength++
        if (/[^a-zA-Z\d]/.test(password)) strength++
        return strength
    }

    const strength = passwordStrength(formData.password)
    const strengthColors = ['bg-gray-300', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo and Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gradient mb-2">Join Hotjar Clone</h1>
                    <p className="text-gray-600">Start understanding your users today</p>
                </div>

                {/* Register Card */}
                <div className="card animate-slide-in">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="input-field"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="input-field"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded ${i <= strength ? strengthColors[strength] : 'bg-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-600">{strengthLabels[strength]}</p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                                required
                                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                                I agree to the{' '}
                                <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || formData.password !== formData.confirmPassword}
                            className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                        { icon: '📊', text: 'Heatmaps' },
                        { icon: '🎥', text: 'Recordings' },
                        { icon: '📈', text: 'Analytics' },
                    ].map((feature, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl mb-1">{feature.icon}</div>
                            <p className="text-xs text-gray-600">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
