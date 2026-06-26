<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    // 1. LİSTELEME
    public function index(Request $request)
    {
        $query = Meeting::with('users')->where('user_id', auth()->id());

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $meetings = $query->latest()->paginate(5);
        return response()->json($meetings, 200);
    }

    // 2. OLUŞTURMA 
    public function store(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id'
        ];

        $messages = [
            'title.required' => 'Toplantı başlığı boş bırakılamaz.',
            'title.max' => 'Başlık çok uzun, en fazla 255 karakter olabilir.',
            'start_time.required' => 'Başlangıç saati seçilmelidir.',
            'end_time.required' => 'Bitiş saati seçilmelidir.',
            'end_time.after' => 'Bitiş saati, başlangıç saatinden sonra olmalıdır.',
            'participant_ids.*.exists' => 'Seçilen katılımcı sistemde kayıtlı değil.'
        ];

        $validated = $request->validate($rules, $messages);

        $validated['user_id'] = auth()->id();
        $meeting = Meeting::create($validated);

        if ($request->has('participant_ids')) {
            $meeting->users()->attach($request->participant_ids);
        }

        return response()->json($meeting->load('users'), 201);
    }

    // 3. GÖSTERME
    public function show(string $id)
    {
        $meeting = Meeting::with('users')->findOrFail($id);

        if ($meeting->user_id !== auth()->id()) {
            return response()->json(['message' => 'Bu toplantıyı görüntüleme yetkiniz yok.'], 403);
        }

        return response()->json($meeting, 200);
    }

    // 4. GÜNCELLEME 
    public function update(Request $request, string $id)
    {
        $meeting = Meeting::findOrFail($id);

        if ($meeting->user_id !== auth()->id()) {
            return response()->json(['message' => 'Bu toplantıyı güncelleme yetkiniz yok.'], 403);
        }

        $rules = [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date|after:start_time',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id'
        ];

        $messages = [
            'title.max' => 'Başlık en fazla 255 karakter olabilir.',
            'end_time.after' => 'Bitiş saati, başlangıç saatinden sonra olmalıdır.',
        ];

        $validated = $request->validate($rules, $messages);

        $meeting->update($validated);

        if ($request->has('participant_ids')) {
            $meeting->users()->sync($request->participant_ids);
        }
        
        return response()->json($meeting->load('users'), 200);
    }

    // 5. SİLME
    public function destroy(string $id)
    {
        $meeting = Meeting::findOrFail($id);

        if ($meeting->user_id !== auth()->id()) {
            return response()->json(['message' => 'Bu toplantıyı silme yetkiniz yok.'], 403);
        }

        $meeting->delete();
        return response()->json(['message' => 'Toplantı başarıyla silindi'], 200);
    }
}