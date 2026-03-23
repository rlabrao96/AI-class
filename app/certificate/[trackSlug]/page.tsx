import { notFound } from 'next/navigation'
import { tracks, getTrack } from '@/lib/modules'
import { CertificateTrackPage } from '@/components/CertificateTrackPage'

export function generateStaticParams() {
  return tracks.map((t) => ({ trackSlug: t.slug }))
}

export default function CertificatePageRoute({
  params,
}: {
  params: { trackSlug: string }
}) {
  const track = getTrack(params.trackSlug)
  if (!track) notFound()
  return <CertificateTrackPage track={track} />
}
