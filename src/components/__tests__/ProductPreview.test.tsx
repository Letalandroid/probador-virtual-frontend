import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductPreview from '../ProductPreview';
import { createMockProduct } from '../../utils/testData';

describe('ProductPreview', () => {
  const mockOnClose = jest.fn();
  const mockProduct = createMockProduct({
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    brand: 'Test Brand',
    color: 'Black',
    stockQuantity: 10,
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    category: {
      id: 'cat-1',
      name: 'Tops',
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ProductPreview
        product={mockProduct}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  it('should render product details when isOpen is true', () => {
    render(
      <ProductPreview
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
    expect(screen.getByText('Tops')).toBeInTheDocument();
    expect(screen.getByText('10 unidades')).toBeInTheDocument();
  });

  it('should display product images', () => {
    render(
      <ProductPreview
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const productImage = screen.getByAltText('Test Product');
    expect(productImage).toBeInTheDocument();
    expect(productImage).toHaveAttribute('src', 'https://example.com/image1.jpg');
  });

  it('should show out of stock message when stock is 0', () => {
    const outOfStockProduct = createMockProduct({
      ...mockProduct,
      stockQuantity: 0,
    });

    render(
      <ProductPreview
        product={outOfStockProduct}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('0 unidades')).toBeInTheDocument();
    expect(screen.getAllByText('Agotado')).toHaveLength(2); // Badge and button
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProductPreview
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside the modal', async () => {
    const user = userEvent.setup();
    render(
      <ProductPreview
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Find the backdrop element and click it
    const backdrop = document.querySelector('[data-state="open"]');
    expect(backdrop).toBeInTheDocument();

    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when clicking inside the modal content', async () => {
    const user = userEvent.setup();
    render(
      <ProductPreview
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    // Click on the modal content (not the backdrop)
    const modalContent = screen.getByText('Test Product');
    await user.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle product with no images', () => {
    const productWithoutImages = createMockProduct({
      ...mockProduct,
      images: [],
    });

    render(
      <ProductPreview
        product={productWithoutImages}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const productImage = screen.getByAltText('Test Product');
    expect(productImage).toBeInTheDocument();
    expect(productImage).toHaveAttribute('src', '');
  });

  it('should handle product with no category', () => {
    const productWithoutCategory = createMockProduct({
      ...mockProduct,
      category: undefined,
    });

    render(
      <ProductPreview
        product={productWithoutCategory}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    // Category should not be displayed
    expect(screen.queryByText('Tops')).not.toBeInTheDocument();
  });

  it('should handle product with no color', () => {
    const productWithoutColor = createMockProduct({
      ...mockProduct,
      color: undefined,
    });

    render(
      <ProductPreview
        product={productWithoutColor}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    // Color should not be displayed
    expect(screen.queryByText('Black')).not.toBeInTheDocument();
  });

  it('should handle product with no brand', () => {
    const productWithoutBrand = createMockProduct({
      ...mockProduct,
      brand: undefined,
    });

    render(
      <ProductPreview
        product={productWithoutBrand}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    // Brand should show default value
    expect(screen.getByText('Marca')).toBeInTheDocument();
  });
});

