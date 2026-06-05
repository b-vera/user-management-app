import { test, expect } from '@playwright/test';

// Run in order — later tests don't depend on earlier state, but failures block the suite
test.describe.configure({ mode: 'serial' });

const SS = 'e2e/screenshots';

test.describe('User management E2E flow', () => {
  // Force Spanish locale so navigator.language resolves to 'es' and the app renders in Spanish
  test.use({ locale: 'es' });
  test('create user — form submit shows success toast and redirects to list', async ({ page }) => {
    await page.goto('/users/new');
    await expect(page).toHaveURL(/\/users\/new/);

    await page.fill('#first_name', 'Test');
    await page.fill('#last_name', 'E2E');
    await page.fill('#username', 'teste2e');
    await page.fill('#email', 'teste2e@example.com');
    await page.selectOption('#role', 'user');

    await page.screenshot({ path: `${SS}/01-create-form-filled.png` });

    await page.getByRole('button', { name: 'Crear usuario' }).click();

    // Toast should confirm creation
    await expect(page.getByText('Usuario creado exitosamente')).toBeVisible({ timeout: 8000 });

    await page.screenshot({ path: `${SS}/02-create-success-toast.png` });

    // Form navigates back to /users on success
    await expect(page).toHaveURL(/\/users$/, { timeout: 5000 });
  });

  test('user list — search returns results from API', async ({ page }) => {
    await page.goto('/users');

    // Wait for the list to populate (table rows or mobile cards)
    const rowOrCard = page.locator('tbody tr, [data-testid="user-card"]').first();
    await expect(rowOrCard).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: `${SS}/03-user-list-loaded.png` });

    // Type in search box — 'emily' matches emilys in dummyjson
    await page.fill('input[type="search"]', 'emily');

    // Target the table row (the mobile card is hidden at desktop viewport)
    await expect(page.locator('tbody tr').filter({ hasText: 'emilys' })).toBeVisible({
      timeout: 8000,
    });

    await page.screenshot({ path: `${SS}/04-search-result.png` });
  });

  test('edit user — change email shows success toast', async ({ page }) => {
    // Navigate directly to edit form of a known dummyjson user
    await page.goto('/users/1/edit');

    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible({ timeout: 8000 });

    await emailInput.clear();
    await emailInput.fill('updated-e2e@example.com');

    await page.screenshot({ path: `${SS}/05-edit-form-changed.png` });

    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Usuario actualizado exitosamente')).toBeVisible({ timeout: 8000 });

    await page.screenshot({ path: `${SS}/06-edit-success-toast.png` });
  });

  test('deactivate user — confirm dialog updates status badge to Inactivo', async ({ page }) => {
    // Use user 2 (independent from the edit test above).
    // After deactivation the form navigates to /users/2, which triggers a fresh GET that
    // dummyjson returns without `active:false`. Intercept that GET and patch the response
    // so the detail page shows "Inactivo" as the store would in production.
    let deactivated = false;
    await page.route('**/dummyjson.com/users/2', async (route) => {
      if (route.request().method() === 'PUT') {
        deactivated = true;
        await route.continue();
      } else if (route.request().method() === 'GET' && deactivated) {
        const response = await route.fetch();
        const json = await response.json();
        await route.fulfill({ json: { ...json, active: false } });
      } else {
        await route.continue();
      }
    });

    await page.goto('/users/2/edit');

    const deactivateBtn = page.getByRole('button', { name: 'Desactivar' }).first();
    await expect(deactivateBtn).toBeVisible({ timeout: 8000 });

    await deactivateBtn.click();

    // CDK Dialog opens with role="alertdialog"
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible({ timeout: 3000 });

    await page.screenshot({ path: `${SS}/07-confirm-dialog.png` });

    // Confirm button inside the dialog
    await dialog.getByRole('button', { name: 'Desactivar' }).click();

    await expect(page.getByText('Usuario desactivado exitosamente')).toBeVisible({ timeout: 8000 });

    // Status badge updates to "Inactivo" on the detail page (/users/2)
    await expect(page.getByText('Inactivo')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: `${SS}/08-deactivated-badge.png` });
  });
});
