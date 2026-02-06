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
  const { data } = useGithubContribution()

  if (!data) return null

  return (
    <section>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />

      <h1 className="text-muted-foreground px-4 text-base font-light">
        <span className="text-primary">$ </span>
        <span className="ml-1">cat ./github-contributions.md</span>
      </h1>
      <div className="border-primary/35 absolute right-0 left-0 h-px w-full border-t" />

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
    </section>
  )
}
