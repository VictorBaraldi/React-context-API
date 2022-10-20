import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
const { render, screen, waitForElementToBeRemoved } = require('@testing-library/react');
import { Home } from './index';

const handlers = [
  rest.get('*jsonplaceholder.typicode.com*', async (req, res, ctx) => {
    return res(
      ctx.json([
        {
          userId: 1,
          id: 1,
          title: 'title1',
          body: 'body1',
          url: 'img1.jpg',
        },
        {
          userId: 2,
          id: 2,
          title: 'title2',
          body: 'body2',
          url: 'img1.jpg',
        },
        {
          userId: 3,
          id: 3,
          title: 'title3',
          body: 'body3',
          url: 'img3.jpg',
        },
      ]),
    );
  }),
];

const server = setupServer(...handlers);

describe('<Home />', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should render search, post and load more', async () => {
    render(<Home />);

    const noMorePosts = screen.getAllByText('Não existem posts com esse título');
    await waitForElementToBeRemoved(noMorePosts);

    const search = screen.getByPlaceholderText(/Type your search/i);
    expect(search).toBeInTheDocument();

    const imgs = screen.getAllByRole('img');
    expect(imgs).toHaveLength(2);

    const btn = screen.getByRole('button', { name: /load more/i });
    expect(btn).toBeInTheDocument();
  });

  it('should search for posts', async () => {
    render(<Home />);

    const noMorePosts = screen.getAllByText('Não existem posts com esse título');
    await waitForElementToBeRemoved(noMorePosts);

    const search = screen.getByPlaceholderText(/Type your search/i);
    expect(search).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'title1 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'title2 2' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'title3 3' })).not.toBeInTheDocument();

    userEvent.type(search, 'title1');
    expect(screen.getByRole('heading', { name: 'title1 1' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'title2 2' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'title3 3' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Search: title1' })).toBeInTheDocument();

    userEvent.clear(search);
    expect(screen.getByRole('heading', { name: 'title1 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'title2 2' })).toBeInTheDocument();

    userEvent.type(search, 'post does not exist');
    expect(screen.getByText('Não existem posts com esse título')).toBeInTheDocument();
  });

  it('should render search, post and load more', async () => {
    render(<Home />);

    const noMorePosts = screen.getAllByText('Não existem posts com esse título');
    await waitForElementToBeRemoved(noMorePosts);

    const btn = screen.getByRole('button', { name: /load more/i });

    userEvent.click(btn);
    expect(screen.getByRole('heading', { name: 'title3 3' })).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });
});
