import { Fragment } from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'

import { uniqueId } from 'lodash-es'
import { Typography } from '../ui/typography'
import ScrollShadow from './scroll-shadow'

type EllipsisListProps<T> = {
  threshhold: number
  data: Array<T>
  template: React.FC<{ data: T }>
}

export default function EllipsisList<T>({ threshhold, data, template: ListItemTemplate }: EllipsisListProps<T>) {
  const visibleData = data.slice(0, threshhold)
  const truncatedData = data.slice(threshhold)

  const isTruncated = data.length > threshhold

  return (
    <div className="flex items-center space-x-1">
      {isTruncated ? (
        <Fragment>
          {visibleData.map((item) => (
            <ListItemTemplate key={uniqueId()} data={item} />
          ))}
          {
            <HoverCard>
              <HoverCardTrigger className="inline-flex cursor-pointer items-center gap-x-2 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                <Typography variant="small" className="whitespace-nowrap">
                  {`... và ${truncatedData.length} dữ liệu khác`}
                </Typography>{' '}
              </HoverCardTrigger>
              <HoverCardContent side="bottom" align="end" className="p-0">
                <ScrollShadow className="flex max-h-40 flex-wrap items-start gap-2 p-4">
                  {truncatedData.map((item) => (
                    <ListItemTemplate key={uniqueId()} data={item} />
                  ))}
                </ScrollShadow>
              </HoverCardContent>
            </HoverCard>
          }
        </Fragment>
      ) : (
        data.map((item) => <ListItemTemplate key={uniqueId()} data={item} />)
      )}
    </div>
  )
}
