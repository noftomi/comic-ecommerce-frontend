import { useNavigate } from 'react-router-dom'

export default function Forbidden() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-6xl font-bold">403</h1>
      <p className="text-xl text-gray-500">No tenés permiso para ver esta página</p>
      <button
        onClick={() => navigate('/')}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Volver al inicio
      </button>
    </div>
  )
}