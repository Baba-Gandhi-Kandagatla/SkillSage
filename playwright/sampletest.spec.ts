import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('ngitadmin');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('ngit123$');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('tab', { name: 'User Management' }).click();
  await page.getByRole('tab', { name: 'Batches' }).click();
  await page.getByRole('tab', { name: 'Subject & Topics' }).click();
  await page.getByRole('button', { name: 'Students' }).click();
  await page.getByRole('option', { name: 'FS ALPHA' }).click();
  await page.getByRole('button', { name: 'Students' }).click();
  await page.getByRole('option', { name: 'demo' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.locator('.relative > .inline-flex').click();
  await page.locator('.relative > .inline-flex').click();
  await page.locator('div:nth-child(2) > button:nth-child(3)').click();
  await page.locator('button:nth-child(4)').first().click();
  await page.getByRole('link', { name: 'College Metrics' }).click();
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('button', { name: 'Add Subject' }).click();
  await page.getByRole('textbox', { name: 'Subject Name' }).click();
  await page.getByRole('textbox', { name: 'Subject Name' }).fill('Testing');
  await page.getByRole('textbox', { name: 'Add topic and press Enter' }).click();
  await page.getByRole('textbox', { name: 'Add topic and press Enter' }).fill('unit testing');
  await page.getByRole('textbox', { name: 'Add topic and press Enter' }).press('Enter');
  await page.getByRole('textbox', { name: 'Add topic and press Enter' }).fill('integration testing');
  await page.getByRole('textbox', { name: 'Add topic and press Enter' }).press('Enter');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('tab', { name: 'Interview Settings' }).click();
  await page.locator('#coding-percentage').getByRole('slider').click();
  await page.locator('#coding-percentage').getByRole('slider').click();

  
  await page.locator('#total-questions').getByRole('slider').click();
  await page.getByRole('link', { name: 'College Metrics' }).click();
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('button', { name: 'Create Interview' }).click();
  await page.getByRole('textbox', { name: 'Interview Name' }).click();
  await page.getByRole('textbox', { name: 'Interview Name' }).fill('PLaywright-test');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Testing' }).click();
  await page.getByRole('button', { name: 'Select All', exact: true }).click();
  await page.getByRole('checkbox', { name: 'demo' }).click();
  await page.getByRole('button', { name: 'Continue to Add Questions' }).click();
  await page.getByRole('button', { name: 'Create Interview' }).click();
  await page.getByRole('row', { name: 'PLaywright-test Testing unit' }).getByRole('button').first().click();
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('menuitem', { name: 'Log Out' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Username' }).fill('22BD1A661Z1');
  await page.getByRole('textbox', { name: 'Username' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('ngit123$');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'Start Interview' }).nth(1).click();
  await page.getByRole('button', { name: 'Yes I Accept' }).click();
  await page.getByRole('button', { name: 'Question rephrasing chances:' }).click();
  await page.getByRole('textbox', { name: 'Type your answer here...' }).click();
  await page.getByRole('textbox', { name: 'Type your answer here...' }).fill('using some testing software i guess');
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();
  await page.getByRole('textbox', { name: 'Type your answer here...' }).click();
  await page.getByRole('textbox', { name: 'Type your answer here...' }).fill('i will do that with playwright as it\'s easy, and i don\'t manually write, because playwright has this codegen feature');
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();
  await page.getByRole('button', { name: 'Skip the Question' }).click();
  await page.getByRole('button', { name: 'Skip Question' }).click();
  await page.getByRole('button', { name: 'Skip the Question' }).click();
  await page.getByRole('button', { name: 'Skip Question' }).click();
  await page.getByRole('textbox', { name: 'Type your answer here...' }).click();
  await page.getByRole('textbox', { name: 'Type your answer here...' }).fill('simple, don;t even need to test it, i can say it\'s fine and good by just seeing it');
  await page.locator('div').filter({ hasText: /^Refresh$/ }).getByRole('button').click();
  await page.getByRole('button').filter({ hasText: /^$/ }).first().click();


  await page.getByRole('button', { name: 'Submit' }).click();


  await page.getByRole('heading', { name: 'Answers submitted' }).click();
  await page.getByText('Please wait for the results.').click();
  await page.locator('div').filter({ hasText: /^Answers submitted successfully!Please wait for the results\.$/ }).getByRole('img').click();
  await page.goto('http://localhost:5173/student/completed-interviews');
  await page.locator('div').filter({ hasText: /^Dashboard$/ }).click();
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('menuitem', { name: 'Log Out' }).click();



   await page.goto('http://localhost:5173/login');
  await page.locator('div').filter({ hasText: /^Username$/ }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('ngitadmin');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('ngit123$');

  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('cell', { name: 'PLaywright-test' }).click();
  await page.getByRole('row', { name: 'PLaywright-test Testing unit' }).getByRole('button').nth(1).click();
  await page.getByRole('row', { name: 'PLaywright-test Testing unit' }).getByRole('button').nth(3).click();
  await page.getByRole('cell', { name: '22BD1A661Z1' }).click();
  await page.getByRole('cell', { name: 'Bharadwaj' }).click();
  await page.getByRole('cell', { name: 'Completed' }).locator('span').click();
  await page.getByRole('button', { name: 'View', exact: true }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('cell', { name: 'PLaywright-test' }).click();
  await page.getByRole('row', { name: 'PLaywright-test Testing unit' }).locator('span').click();
  await page.getByRole('row', { name: 'PLaywright-test Testing unit' }).getByRole('button').nth(2).click();
  await page.getByRole('textbox', { name: 'Type "delete" to confirm:' }).click();
  await page.getByRole('textbox', { name: 'Type "delete" to confirm:' }).fill('delete');
  await page.getByRole('button', { name: 'Delete Interview' }).click();
  await page.getByRole('link', { name: 'Admin Panel' }).click();
  await page.getByRole('tab', { name: 'Subject & Topics' }).click();
  await page.getByText('Testing', { exact: true }).click();
  await page.getByRole('button', { name: 'Delete subject' }).nth(1).click();
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('menuitem', { name: 'Log Out' }).click();

});


 


