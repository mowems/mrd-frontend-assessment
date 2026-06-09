# Dear candidate

Please commit this file with your name below. It is often not possible to accurately tell who the owner of a repository is. Please help us not attribute your great coding effort to a lesser candidate.

**The name on your CV is David Unuigbe**

## Thank you

Thank you for taking the time to complete this take-home coding assignment.

# Submission feedback

## Planning

I spent some time understanding the existing streaming implementation and how the backend emitted progressive updates before deciding on the frontend rendering approach.

The challenge was clear overall, although I needed to inspect the stream format and understand the lifecycle of the restaurant updates before implementing the UI.

I did not immediately know the exact implementation details, but I knew I wanted the UI to progressively hydrate as restaurant data streamed in rather than waiting for the entire dataset to complete.

Once I broke the problem into smaller parts — initial rendering, chunk processing, row updates, progress tracking, and error handling — the time constraint felt manageable.

## Coding

The biggest hurdle was handling streamed chunk parsing safely and ensuring partially received chunks did not break the parser.

Another area that took time was restructuring the UI so that progressive updates felt intentional and user-friendly instead of looking like raw debug output.

I am happy with the final solution. It progressively renders restaurant data, updates rows incrementally, tracks progress in real time, and handles failures gracefully without interrupting the rest of the stream.

The implementation also separates responsibilities into focused rendering and processing functions to keep the code maintainable.

AI was used as a development assistant for discussing implementation approaches, reviewing architecture decisions, and refining UI/state management ideas. All final implementation and integration decisions were reviewed and adjusted manually.

## Wrap up

With another hour, I would likely add:

- retry functionality for failed restaurant requests
- skeleton loading placeholders
- additional responsive/mobile refinements
- virtualization support for very large datasets
- small animations for row hydration and status transitions

Thank you again for the opportunity to complete the assignment.
