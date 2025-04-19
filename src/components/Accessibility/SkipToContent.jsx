import React from 'react';
import { getSkipLinkProps } from '../../utils/accessibilityUtils';

/**
 * SkipToContent component for keyboard accessibility
 * Allows keyboard users to skip navigation and go directly to main content
 * 
 * @param {Object} props - Component props
 * @param {string} props.mainContentId - ID of the main content container
 * @param {string} props.label - Custom label text (optional)
 * @returns {React.ReactElement} - Skip to content link component
 */
function SkipToContent({ mainContentId = 'main-content', label }) {
  const skipLinkProps = getSkipLinkProps({
    target: mainContentId,
    label: label || 'Skip to main content'
  });

  return (
    <a {...skipLinkProps}>
      {skipLinkProps.children}
    </a>
  );
}

export default SkipToContent;