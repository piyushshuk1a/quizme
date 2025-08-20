import { type TypographyVariantsOptions } from '@mui/material';

import { pxToRem } from '@/utils';

import { TYPOGRAPHY_CONSTANTS } from './theme.constants';
import { type VariantMapType } from './theme.types';

const { fontStyle, fontWeights } = TYPOGRAPHY_CONSTANTS;

/**
 * Typographies to be used in the App
 */
export const TYPOGRAPHY: TypographyVariantsOptions = {
  /**
   * To add new typography variant firstly add it to the TypographyVariants interface
   * and TypographyVariantsOptions interface inside src/theme/index.ts, after that add its
   * configuration here.
   *
   * @note Default Typography variants can also be overridden by redefining new
   * configuration for corresponding variants here
   */
  fontFamily: ['Poppins', 'sans-serif'].join(', '),
  title: {
    fontSize: pxToRem(fontStyle.title.fontSize),
    lineHeight: pxToRem(fontStyle.title.lineHeight),
    fontWeight: fontWeights.regular,
  },
  subtitle: {
    fontSize: pxToRem(fontStyle.subtitle.fontSize),
    lineHeight: pxToRem(fontStyle.subtitle.lineHeight),
    fontWeight: fontWeights.regular,
  },
  body1: {
    fontSize: pxToRem(fontStyle.body1.fontSize),
    lineHeight: pxToRem(fontStyle.body1.lineHeight),
    fontWeight: fontWeights.regular,
  },
  body2: {
    fontSize: pxToRem(fontStyle.body2.fontSize),
    lineHeight: pxToRem(fontStyle.body2.lineHeight),
    fontWeight: fontWeights.regular,
  },
} as const;

/**
 * Associate a UI variant with a semantic element.
 */
export const VARIANT_MAP: VariantMapType = {
  title: 'h2',
  subtitle: 'span',
};
