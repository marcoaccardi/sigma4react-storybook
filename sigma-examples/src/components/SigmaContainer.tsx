/**
 * SigmaContainer
 *
 * A wrapper around @react-sigma/core's SigmaContainer that adds proper cleanup.
 *
 * PROBLEM:
 * The original SigmaContainer from @react-sigma/core has a bug where its useEffect (lines 92-110)
 * lacks a cleanup function to call sigma.kill() on unmount. This causes WebGL context leaks.
 *
 * SOLUTION:
 * This wrapper injects a cleanup helper component INSIDE the original SigmaContainer that:
 * 1. Uses useSigma() to access the Sigma instance directly
 * 2. Kills the instance in its cleanup effect (which runs BEFORE container unmounts)
 * 3. Prevents the WebGL context from leaking
 *
 * USAGE:
 * Use this component exactly like the original SigmaContainer:
 *
 * ```tsx
 * import { SigmaContainer } from '@/components/SigmaContainer';
 *
 * <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
 *   <LoadGraph />
 * </SigmaContainer>
 * ```
 */

import { forwardRef, useEffect, type FC } from 'react';
import type { ForwardedRef, PropsWithChildren, ReactElement } from 'react';
import { SigmaContainer as OriginalSigmaContainer, useSigma } from '@react-sigma/core';
import type { Attributes } from 'graphology-types';
import type { Sigma } from 'sigma';
import type { Settings } from 'sigma/settings';
import type { GraphType } from '@react-sigma/core';

interface SigmaContainerProps<N extends Attributes, E extends Attributes, G extends Attributes> {
  graph?: GraphType<N, E, G>;
  settings?: Partial<Settings<N, E, G>>;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Internal cleanup helper that runs inside the original SigmaContainer
 * This component accesses the Sigma instance via useSigma() and kills it on unmount.
 * Since it's a child of the container, its cleanup runs BEFORE the container unmounts.
 */
const SigmaCleanupHelper: FC = () => {
  const sigma = useSigma();

  useEffect(() => {
    // Cleanup function that kills the Sigma instance
    return () => {
      try {
        // Kill the instance to release WebGL context
        sigma.kill();
      } catch (error) {
        // Silently catch errors (instance might already be dead)
        console.debug('Sigma instance cleanup:', error);
      }
    };
  }, [sigma]);

  return null;
};

function SigmaContainerComponent<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes,
>(
  { children, ...props }: PropsWithChildren<SigmaContainerProps<N, E, G>>,
  forwardedRef: ForwardedRef<Sigma<N, E, G> | null>
) {
  return (
    <OriginalSigmaContainer<N, E, G> ref={forwardedRef} {...props}>
      {/* Cleanup helper must be first child to ensure it's created/destroyed at the right time */}
      <SigmaCleanupHelper />
      {children}
    </OriginalSigmaContainer>
  );
}

// Export with proper typing for generics
export const SigmaContainer = forwardRef(SigmaContainerComponent) as <
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes,
>(
  props: PropsWithChildren<SigmaContainerProps<N, E, G>> & { ref?: ForwardedRef<Sigma<N, E, G> | null> }
) => ReactElement;
