import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StreetLookup } from '../../StreetLookup';

const allenwinden = {
  street: 'Allenwindenstrasse', houseNumber: '4', houseNumberAddition: '', postcode: '6319', town: 'Allenwinden',
};

const renderLookup = () => {
  const onChange = vi.fn();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <StreetLookup value="x" onChange={onChange} />
    </QueryClientProvider>,
  );
  return onChange;
};

const pickAllenwinden = async (onChange: ReturnType<typeof vi.fn>) => {
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Allenwinden' } });
  fireEvent.mouseDown(await screen.findByRole('option'));
  expect(onChange).toHaveBeenLastCalledWith('Allenwindenstrasse 4, 6319 Allenwinden', '6319', 'Allenwinden');
};

// @covers FR-01.01
describe('StreetLookup typed over a picked address', () => {
  beforeEach(() => {
    // System boundary: the same-origin lookup service.
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ results: [allenwinden] })));
  });
  afterEach(() => vi.restoreAllMocks());

  it('clears postcode and town when a different address is typed over the pick', async () => {
    const onChange = renderLookup();
    await pickAllenwinden(onChange);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Seestrasse 3, 6300 Zug' } });

    expect(onChange).toHaveBeenLastCalledWith('Seestrasse 3, 6300 Zug', undefined, undefined);
  });

  it('keeps postcode and town when the picked street is typed with a house number', async () => {
    const onChange = renderLookup();
    await pickAllenwinden(onChange);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Allenwindenstrasse , 6319 Allenwinden' } });
    onChange.mockClear();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Allenwindenstrasse 4, 6319 Allenwinden' } });

    expect(onChange).toHaveBeenLastCalledWith('Allenwindenstrasse 4, 6319 Allenwinden', '6319', 'Allenwinden');
  });

  it('passes a changed house number on to the form', async () => {
    const onChange = renderLookup();
    await pickAllenwinden(onChange);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Allenwindenstrasse 6, 6319 Allenwinden' } });

    expect(onChange).toHaveBeenLastCalledWith('Allenwindenstrasse 6, 6319 Allenwinden', '6319', 'Allenwinden');
  });

  it('uses the house number of the clicked suggestion over a different typed one', async () => {
    const onChange = renderLookup();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Allenwindenstrasse 1, 6319 Allenwinden' } });
    fireEvent.mouseDown(await screen.findByRole('option'));

    expect(onChange).toHaveBeenLastCalledWith('Allenwindenstrasse 4, 6319 Allenwinden', '6319', 'Allenwinden');
  });

  it('clears postcode and town when a longer street name is typed over the pick', async () => {
    const onChange = renderLookup();
    await pickAllenwinden(onChange);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Allenwindenstrassenweg 4, 6319 Allenwinden' } });

    expect(onChange).toHaveBeenLastCalledWith('Allenwindenstrassenweg 4, 6319 Allenwinden', undefined, undefined);
  });
});
