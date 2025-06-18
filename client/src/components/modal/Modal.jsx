const Modal = ({ showResetLink, connectToServer, setOpen, theme, setTheme, resetToDefaultUI }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-fade-in transition-all duration-300">

                

                <h2 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
                    ✨ Customize Your Experience
                </h2>

                <div className="text-gray-600 mb-6 text-center space-y-2">
                    <p>Would you like this website to be tailored just for you?</p>
                    <h6 className="font-medium text-pink-600">Try our new theme experience!</h6>
                </div>
                {showResetLink? <button
                    onClick={resetToDefaultUI}
                    className="absolute right-[40px] text-sm text-gray-400 hover:text-pink-600 transition"
                >
                    Switch to Default UI
                </button> : ''}

                <div className="mb-6">
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter your preferred theme
                    </label>
                    <input
                        type="text"
                        id="theme"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="e.g., Dark, Christmas, Ghibli"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition duration-200"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-5 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-medium shadow-sm transition duration-200"
                        onClick={connectToServer}
                    >
                        Generate Content
                    </button>
                </div>
            </div>
        </div>)
}

export default Modal;