import { useParams } from 'react-router-dom'
import Container from '../components/ui/Container'

export default function ProductDetailPage() {
  const { id } = useParams()
  return (
    <Container className="py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Product #{id}</h1>
      <p className="mt-2 text-gray-500">Product detail coming soon.</p>
    </Container>
  )
}
