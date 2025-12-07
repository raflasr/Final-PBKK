import React, { useEffect, useState } from 'react'
import { api } from "../api/axios";

export default function Profile() {
  // state untuk menyimpan data profile user
  const [profile, setProfile] = useState(null)

  // useEffect dipakai sekali saat komponen mount untuk fetch data profile
  useEffect(() => {
    api.get('/auth/profile') // panggil backend untuk ambil profile user saat ini
      .then(r => setProfile(r.data)) // simpan data profile ke state
      .catch(() => setProfile(null)) // jika error, set profile jadi null
  }, [])

  // fungsi untuk upload avatar baru
  const uploadAvatar = async (e) => {
    const file = e.target.files[0] // ambil file yang dipilih
    if (!file) return
    const fd = new FormData()      // buat FormData untuk upload file
    fd.append('avatar', file)      // append file ke FormData

    try {
      await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' }})
      alert('Avatar uploaded')     // kasih notifikasi berhasil upload

      // refetch profile setelah upload agar avatar terbaru tampil
      const r = await api.get('/auth/profile')
      setProfile(r.data)
    } catch (err) {
      alert('Upload failed')       // kasih notifikasi jika gagal
    }
  }

  return (
    <div>
      <h1>Profile</h1>

      {profile ? (
        // tampilkan info profile jika data sudah ada
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img 
            src={profile.avatarUrl || '/default-avatar.png'} // tampilkan avatar atau default
            alt="avatar" 
            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} 
          />
          <div>
            <div><strong>{profile.name}</strong></div>  {/* nama user */}
            <div>{profile.email}</div>                 {/* email user */}
            <div style={{ marginTop: 8 }}>
              <label>
                Upload avatar
                <input type="file" onChange={uploadAvatar} /> {/* input file untuk upload */}
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading profile...</div> // tampil loading jika profile belum tersedia
      )}
    </div>
  )
}
