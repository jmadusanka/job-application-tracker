


export function scoreColor(score: number): string {
  if (score >= 80) {
    return 'text-green-600';
  } else if (score >= 60) {
    return 'text-amber-600';
  } else {
    return 'text-red-600';
  }
}

export function scoreBg(score: number): string {
  if (score >= 80) {
    return 'bg-green-100 text-green-700';
  } else if (score >= 60) {
    return 'bg-amber-100 text-amber-700';
  } else {
    return 'bg-red-100 text-red-700';
  }
}

export function formatDate(date: Date | string | null): string {
  if (!date) {
    return 'N/A';
  }

  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
