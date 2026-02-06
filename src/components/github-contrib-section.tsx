import { eachDayOfInterval, endOfYear, formatISO, startOfYear } from 'date-fns'
import { Badge } from './ui/badge'
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from '@/components/kibo-ui/contribution-graph'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { useGithubContribution } from '@/hooks/use-github-contribution'

export const GithubContribSection = () => {
  const { data, isPending } = useGithubContribution()

  return (
    <section>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />

      <h1 className="text-muted-foreground px-4 text-base font-light">
        <span className="text-primary">$ </span>
        <span className="ml-1">cat ./github-contributions.md</span>
      </h1>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />

      {isPending || !data ? (
        <GithubContribSectionLoading />
      ) : (
        <TooltipProvider>
          <ContributionGraph data={data.contributions} className="p-4">
            <ContributionGraphCalendar>
              {({ activity, dayIndex, weekIndex }) => (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <g>
                      <ContributionGraphBlock
                        activity={activity}
                        className="cursor-pointer"
                        dayIndex={dayIndex}
                        weekIndex={weekIndex}
                      />
                    </g>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{activity.date}</p>
                    <p>{activity.count} contributions</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </ContributionGraphCalendar>
            <ContributionGraphFooter>
              <ContributionGraphTotalCount>
                {({ totalCount, year }) => (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Year {year}:
                    </span>
                    <Badge variant="secondary">
                      {totalCount.toLocaleString()} contributions
                    </Badge>
                  </div>
                )}
              </ContributionGraphTotalCount>
              <ContributionGraphLegend />
            </ContributionGraphFooter>
          </ContributionGraph>
        </TooltipProvider>
      )}

      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />
    </section>
  )
}

// Deterministic pseudo-random number generator to prevent hydration mismatch
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const maxCount = 20
const maxLevel = 4
const now = new Date()
const days = eachDayOfInterval({
  start: startOfYear(now),
  end: endOfYear(now),
})

const data = days.map((date, index) => {
  const c = Math.round(
    pseudoRandom(index + 1) * maxCount -
      pseudoRandom(index + 1 + days.length) * (0.8 * maxCount),
  )
  const count = Math.max(0, c)
  const level = Math.ceil((count / maxCount) * maxLevel)
  return {
    date: formatISO(date, { representation: 'date' }),
    count,
    level,
  }
})
const GithubContribSectionLoading = () => {
  return (
    <div className="relative">
      <div className="border-primary/35 absolute right-0 left-0 z-1 h-px w-full border-t" />
      <div className="absolute size-full backdrop-blur-sm" />
      <TooltipProvider>
        <ContributionGraph data={data} className="p-4">
          <ContributionGraphCalendar>
            {({ activity, dayIndex, weekIndex }) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <g>
                    <ContributionGraphBlock
                      activity={activity}
                      className="cursor-pointer"
                      dayIndex={dayIndex}
                      weekIndex={weekIndex}
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{activity.date}</p>
                  <p>{activity.count} contributions</p>
                </TooltipContent>
              </Tooltip>
            )}
          </ContributionGraphCalendar>
          <ContributionGraphFooter>
            <ContributionGraphTotalCount>
              {({ totalCount, year }) => (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Year {year}:
                  </span>
                  <Badge variant="secondary">
                    {totalCount.toLocaleString()} contributions
                  </Badge>
                </div>
              )}
            </ContributionGraphTotalCount>
            <ContributionGraphLegend />
          </ContributionGraphFooter>
        </ContributionGraph>
      </TooltipProvider>
    </div>
  )
}
