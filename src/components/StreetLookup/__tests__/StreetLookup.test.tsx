import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StreetLookup } from '../../StreetLookup';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));

// System boundary: the address-lookup edge function.
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke } },
}));

const allenwinden = {
  STRID: 1, StreetName: 'Allenwindenstrasse', ZipCode: '6319', TownName: 'Allenwinden',
  HouseNo: '4', HouseNoAddition: '',
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
    invoke.mockResolvedValue({ data: { QueryAutoComplete4Result: { AutoCompleteResult: [allenwinden] } }, error: null });
  });

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
