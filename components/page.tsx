"use client"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import '../app/globals.css'

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [posts, setPosts] = useState<string[]>([])
  const [selectedDept, setSelectedDept] = useState("")
  const [selectedPost, setSelectedPost] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const SHEET_URL = process.env.NEXT_PUBLIC_CSV_URL || ""

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(SHEET_URL)
        if (!res.ok) throw new Error("Failed to fetch CSV")
        
        const text = await res.text()
        const rows = text.trim().split("\n").map(r => {
          const matches = r.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)
          return matches ? matches.map(m => m.replace(/^"|"$/g, '').trim()) : []
        })
        
        const headers = rows[0]
        const entries = rows.slice(1).map(r => {
          const obj: any = {}
          headers.forEach((h, i) => {
            obj[h.trim()] = r[i]?.trim() || ""
          })
          return obj
        })

        setData(entries)
        const depts = [...new Set(entries.map(e => e.dept).filter(Boolean))]
        setDepartments(depts)
        setLoading(false)
      } catch (err) {
        setError("Error loading data")
        setLoading(false)
        console.error(err)
      }
    }
    if (SHEET_URL) fetchData()
  }, [SHEET_URL])

  useEffect(() => {
    if (!selectedDept) {
      setPosts([])
      return
    }
    const deptPosts = data.filter(d => d.dept === selectedDept)
    const uniquePosts = [...new Set(deptPosts.map(d => d.post).filter(Boolean))]
    setPosts(uniquePosts)
    setSelectedPost("")
  }, [selectedDept, data])

  const handleFetchDetails = () => {
    if (!selectedPost || !selectedDept) return
    router.push(`/details?dept=${encodeURIComponent(selectedDept)}&post=${encodeURIComponent(selectedPost)}`)
  }

  return (
    <div className="box" style={{ pointerEvents: 'none' }}>
      <div className="dashboard" style={{ pointerEvents: 'auto' }}>
        <span className="department">Department</span>
        <span className="dash">Dash<span>board</span></span>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && (
          <>
            <div className="menu-row">
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={selectedPost}
                onChange={e => setSelectedPost(e.target.value)}
                disabled={!selectedDept}
              >
                <option value="">Select Post</option>
                {posts.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
              <button 
                onClick={handleFetchDetails}
                disabled={!selectedDept || !selectedPost}
              >
                Fetch Details
              </button>
          </>
        )}
      </div>
    </div>
  )
}