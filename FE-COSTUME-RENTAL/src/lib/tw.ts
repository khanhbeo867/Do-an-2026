import twStyled from 'tailwind-styled-components'

type TwModule = {
  default?: typeof twStyled
}

// * SSR may expose this package as default.default; normalize it once here.
const tw = ((twStyled as TwModule).default ?? twStyled) as typeof twStyled

export default tw
