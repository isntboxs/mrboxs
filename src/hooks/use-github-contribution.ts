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
  const year = new Date().getFullYear()
  const url = new URL(
    `/v4/${username}?y=${year}`,
    'https://github-contributions-api.jogruber.de',
  )
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`GitHub contributions API error: ${response.status}`)
  }
  const data = (await response.json()) as Response
  const total = data.total[year]
  return { contributions: data.contributions, total }
}

export const useGithubContribution = () => {
  return useQuery({
    queryKey: ['github-contribution'],
    queryFn: getCachedContributions,
  })
}
