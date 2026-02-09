public function update(Request $request)
{
    $user = Auth::user();

    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'phone_number' => 'nullable|string|max:20',
        'address' => 'nullable|string|max:500',
        'city' => 'nullable|string|max:100',
        'state' => 'nullable|string|max:100',
        'postcode' => 'nullable|string|max:20',
        'country' => 'nullable|string|max:100',
        'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
    ]);

    if ($request->hasFile('profile_image')) {
        // Delete old image if it exists
        if ($user->profile_image) {
            Storage::disk('public')->delete($user->profile_image);
        }
        $path = $request->file('profile_image')->store('profiles', 'public');
        $user->profile_image = $path;
    }

    // Update all fields
    $user->name = $request->name;
    $user->email = $request->email;
    $user->phone_number = $request->phone_number;
    $user->address = $request->address;
    $user->city = $request->city;
    $user->state = $request->state;
    $user->postcode = $request->postcode;
    $user->country = $request->country;
    
    $user->save();

    return response()->json([
        'message' => 'Profile updated successfully',
        'user' => $user->fresh()
    ]);
}