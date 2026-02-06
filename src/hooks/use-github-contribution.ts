import { useQuery } from '@tanstack/react-query'

type Contribution = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

type Response = {
  total: {
    [year: number]: number
    [year: string]: number // 'lastYear;
  }
  contributions: Array<Contribution>
}

export const getCachedContributions = async () => {
  const username = 'mrboxs'
  const url = new URL(
    `/v4/${username}?y=2026`,
    'https://github-contributions-api.jogruber.de',
  )
  const response = await fetch(url)
  const data = (await response.json()) as Response
  const total = data.total[new Date().getFullYear()]

  return { contributions: data.contributions, total }
}

export const useGithubContribution = () => {
  return useQuery({
    queryKey: ['github-contribution'],
    queryFn: getCachedContributions,
  })
}
